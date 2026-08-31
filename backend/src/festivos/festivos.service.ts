import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AmbitoFestivo } from '@prisma/client';
import { CreateFestivoDto } from './dto/create-festivo.dto';
import { calcularViernesSanto } from '../common/utils/pascua';

const FESTIVOS_FIJOS = [
  { mes: 1,  dia: 1,  descripcion: 'Año Nuevo' },
  { mes: 1,  dia: 6,  descripcion: 'Epifanía del Señor' },
  { mes: 5,  dia: 1,  descripcion: 'Fiesta del Trabajo' },
  { mes: 8,  dia: 15, descripcion: 'Asunción de la Virgen' },
  { mes: 10, dia: 12, descripcion: 'Fiesta Nacional de España' },
  { mes: 11, dia: 1,  descripcion: 'Todos los Santos' },
  { mes: 12, dia: 6,  descripcion: 'Día de la Constitución Española' },
  { mes: 12, dia: 8,  descripcion: 'Inmaculada Concepción' },
  { mes: 12, dia: 25, descripcion: 'Natividad del Señor' },
];

/**
 * Un festivo nacional que cae en domingo se traslada al lunes siguiente
 * (art. 37.2 del Estatuto de los Trabajadores).
 *
 * Importa más de lo que parece: la tabla de sesiones del contrato se calcula
 * sobre estos festivos, y en el curso 2026-2027 son justo los dos traslados
 * (1-nov y 6-dic de 2026, ambos domingo) los que hacen que las familias de
 * lunes pierdan sesión. Sin trasladar, el contrato saldría con dos sesiones de
 * más.
 *
 * Es la regla general; algún año el decreto autonómico puede resolverlo de otro
 * modo, y para eso está el alta manual de festivos.
 */
function trasladarSiDomingo(fecha: Date): { fecha: Date; trasladado: boolean } {
  if (fecha.getDay() !== 0) return { fecha, trasladado: false };
  const lunes = new Date(fecha);
  lunes.setDate(lunes.getDate() + 1);
  return { fecha: lunes, trasladado: true };
}

@Injectable()
export class FestivosService {
  constructor(private readonly prisma: PrismaService) {}

  async getFestivos(anio: number, ccaa?: string, provincia?: string) {
    return this.prisma.festivo.findMany({
      where: {
        anio,
        ...(ccaa ? { ccaa } : {}),
        ...(provincia ? { provincia } : {}),
      },
      orderBy: { fecha: 'asc' },
    });
  }

  async create(dto: CreateFestivoDto) {
    return this.prisma.festivo.create({
      data: {
        fecha: new Date(dto.fecha),
        descripcion: dto.descripcion,
        ambito: dto.ambito,
        ccaa: dto.ccaa ?? null,
        provincia: dto.provincia ?? null,
        anio: new Date(dto.fecha).getFullYear(),
      },
    });
  }

  async remove(id: string) {
    const festivo = await this.prisma.festivo.findUnique({ where: { id } });
    if (!festivo) throw new NotFoundException(`Festivo ${id} no encontrado`);
    await this.prisma.festivo.delete({ where: { id } });
  }

  async importarNacionales(anio: number): Promise<{ importados: number; omitidos: number }> {
    const viernesSanto = calcularViernesSanto(anio);

    const candidatos = [
      ...FESTIVOS_FIJOS.map(f => {
        const original = new Date(anio, f.mes - 1, f.dia, 12, 0, 0);
        const { fecha, trasladado } = trasladarSiDomingo(original);
        return {
          fecha,
          descripcion: trasladado
            ? `${f.descripcion} (trasladado del domingo)`
            : f.descripcion,
        };
      }),
      { fecha: viernesSanto, descripcion: 'Viernes Santo' },
    ].map(f => ({
      fecha: f.fecha,
      descripcion: f.descripcion,
      ambito: AmbitoFestivo.NACIONAL,
      ccaa: null,
      provincia: null,
      anio,
    }));

    // `createMany({ skipDuplicates })` aquí no hace nada: `Festivo` no tiene
    // ninguna restricción única, solo índices. Sin este filtro previo, volver a
    // importar un año duplicaba los diez registros y falseaba el calendario.
    const existentes = await this.prisma.festivo.findMany({
      where: { anio, ambito: AmbitoFestivo.NACIONAL },
      select: { fecha: true },
    });
    const yaEsta = new Set(existentes.map(e => this.claveDia(e.fecha)));

    const nuevos = candidatos.filter(c => !yaEsta.has(this.claveDia(c.fecha)));

    if (nuevos.length > 0) {
      await this.prisma.festivo.createMany({ data: nuevos });
    }

    return { importados: nuevos.length, omitidos: candidatos.length - nuevos.length };
  }

  async tieneNacionales(anio: number): Promise<boolean> {
    const count = await this.prisma.festivo.count({
      where: { anio, ambito: AmbitoFestivo.NACIONAL },
    });
    return count > 0;
  }

  /** Día natural, para comparar sin que la hora estropee la igualdad. */
  private claveDia(fecha: Date): string {
    return `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}`;
  }
}
