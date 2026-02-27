import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { execFileSync, spawnSync } from 'child_process';

@Injectable()
export class InformesPdfService {
  private readonly logger = new Logger(InformesPdfService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generarPdf(informeId: string): Promise<Buffer> {
    // ── 1. Cargar el informe con todas las relaciones ──────────────────────
    const informe = await this.prisma.informe.findUnique({
      where: { id: informeId },
      include: {
        cliente: { include: { colegio: true } },
        trabajador: true,
      },
    });

    if (!informe) {
      throw new NotFoundException(`Informe ${informeId} no encontrado`);
    }

    // ── 2. Calcular edad ───────────────────────────────────────────────────
    const edad = informe.cliente.fechaNacimiento
      ? this.calcularEdad(new Date(informe.cliente.fechaNacimiento))
      : null;

    // ── 3. Parsear snapshot GAS ────────────────────────────────────────────
    let snapshot: any[] = [];
    if (informe.objetivosSnapshotJson) {
      try {
        snapshot = JSON.parse(informe.objetivosSnapshotJson as string);
      } catch {}
    }

    // ── 4. Construir datos para el script Python ───────────────────────────
    const datos = {
      titulo: informe.titulo,
      tipo: informe.tipoInforme,
      elaborado_por: `${informe.trabajador.nombre} ${informe.trabajador.apellidos}`,
      num_colegiada: (informe.trabajador as any).numColegiada ?? '',
      fecha_elaboracion: new Date(informe.createdAt).toLocaleDateString('es-ES'),
      alumno: {
        nombre: `${informe.cliente.apellidos}, ${informe.cliente.nombre}`,
        nombre_pila: informe.cliente.nombre,
        fecha_nacimiento: informe.cliente.fechaNacimiento
          ? new Date(informe.cliente.fechaNacimiento).toLocaleDateString('es-ES')
          : '',
        edad: edad ? `${edad} años` : '',
        curso: informe.cliente.curso ?? '',
        colegio: informe.cliente.colegio?.nombre ?? '',
      },
      motivoConsulta:          informe.motivoConsulta          ?? '',
      analisisInformacion:     informe.analisisInformacion     ?? '',
      evaluacionInicial:       informe.evaluacionInicial       ?? '',
      objetivosGeneralesTexto: informe.objetivosGeneralesTexto ?? '',
      snapshot,
    };

    // ── 5. Resolver ruta del script ────────────────────────────────────────
    // Buscar el script en varias ubicaciones posibles
    const posiblesRutas = [
      path.resolve(__dirname, '..', '..', 'scripts', 'generar_informe.py'),
      path.resolve(process.cwd(), 'scripts', 'generar_informe.py'),
      path.resolve(process.cwd(), 'src', 'scripts', 'generar_informe.py'),
    ];

    const scriptPath = posiblesRutas.find(p => fs.existsSync(p));

    if (!scriptPath) {
      this.logger.error(`Script no encontrado. Rutas buscadas:\n${posiblesRutas.join('\n')}`);
      throw new InternalServerErrorException(
        `Script generar_informe.py no encontrado. Colócalo en: ${posiblesRutas[1]}`
      );
    }

    this.logger.log(`📄 Usando script: ${scriptPath}`);

    // ── 6. Verificar que Python está disponible ────────────────────────────
    const pythonCheck = spawnSync('python3', ['--version']);
    if (pythonCheck.error) {
      throw new InternalServerErrorException('python3 no está disponible en el sistema');
    }

    // ── 7. Ejecutar script ─────────────────────────────────────────────────
    const tmpDir   = os.tmpdir();
    const jsonPath = path.join(tmpDir, `informe_${informeId}.json`);
    const pdfPath  = path.join(tmpDir, `informe_${informeId}.pdf`);

    try {
      fs.writeFileSync(jsonPath, JSON.stringify(datos, null, 2), 'utf8');

      const result = spawnSync('python3', [scriptPath, jsonPath, pdfPath], {
        timeout: 30_000,
        encoding: 'utf8',
      });

      // Mostrar siempre stdout/stderr para debugging
      if (result.stdout) this.logger.log(`Python stdout: ${result.stdout}`);
      if (result.stderr) this.logger.error(`Python stderr: ${result.stderr}`);

      if (result.status !== 0) {
        throw new InternalServerErrorException(
          `Error al generar PDF (código ${result.status}): ${result.stderr || 'sin mensaje'}`
        );
      }

      if (!fs.existsSync(pdfPath)) {
        throw new InternalServerErrorException('El script no generó el PDF');
      }

      const buffer = fs.readFileSync(pdfPath);
      this.logger.log(`✅ PDF generado: ${buffer.length} bytes`);
      return buffer;

    } finally {
      if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
      if (fs.existsSync(pdfPath))  fs.unlinkSync(pdfPath);
    }
  }

  private calcularEdad(fechaNac: Date): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) edad--;
    return edad;
  }
}