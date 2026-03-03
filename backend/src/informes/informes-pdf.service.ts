import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfGeneratorService } from '../common/pdf/pdf-generator.service';
import { buildInformeHtml } from './templates/informe.template';

@Injectable()
export class InformesPdfService {
  private readonly logger = new Logger(InformesPdfService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfGenerator: PdfGeneratorService,
  ) {}

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
      ? this.calcularEdad(new Date(informe.cliente.fechaNacimiento)).texto
      : null;

    // ── 3. Parsear snapshot GAS ────────────────────────────────────────────
    let snapshot: any[] = [];
    if (informe.objetivosSnapshotJson) {
      try {
        snapshot = JSON.parse(informe.objetivosSnapshotJson as string);
      } catch {}
    }

    // ── 4. Construir objeto de datos para el template ──────────────────────
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
        edad: edad ?? '',
        curso: informe.cliente.curso ?? '',
        colegio: informe.cliente.colegio?.nombre ?? '',
      },
      motivoConsulta: informe.motivoConsulta ?? '',
      analisisInformacion: informe.analisisInformacion ?? '',
      evaluacionInicial: informe.evaluacionInicial ?? '',
      objetivosGeneralesTexto: informe.objetivosGeneralesTexto ?? '',
      evolucionObservada: (informe as any).evolucionObservada ?? '',
      objetivosProximoCurso: (informe as any).objetivosProximoCurso ?? '',
      recomendaciones: (informe as any).recomendaciones ?? '',
      snapshot,
    };

    // ── 5. Generar PDF con Puppeteer ───────────────────────────────────────
    this.logger.log(`📄 Generando PDF para informe ${informeId}`);
    const html = buildInformeHtml(datos);
    return this.pdfGenerator.generatePdf(html);
  }

  calcularEdad(fechaNacimiento: Date | string): {
    anios: number;
    meses: number;
    dias: number;
    texto: string;
  } {
    const fecha =
      typeof fechaNacimiento === 'string'
        ? new Date(fechaNacimiento)
        : fechaNacimiento;
    const hoy = new Date();

    let anios = hoy.getFullYear() - fecha.getFullYear();
    let meses = hoy.getMonth() - fecha.getMonth();
    let dias = hoy.getDate() - fecha.getDate();

    if (dias < 0) {
      meses--;
      const ultimoDiaMesAnterior = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        0,
      ).getDate();
      dias += ultimoDiaMesAnterior;
    }
    if (meses < 0) {
      anios--;
      meses += 12;
    }

    const partes: string[] = [];
    if (anios > 0) partes.push(anios === 1 ? '1 año' : `${anios} años`);
    if (meses > 0) partes.push(meses === 1 ? '1 mes' : `${meses} meses`);
    if (dias > 0) partes.push(dias === 1 ? '1 día' : `${dias} días`);

    return { anios, meses, dias, texto: partes.join(', ') || '0 días' };
  }
}
