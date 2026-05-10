import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AmbitoFestivo } from '@prisma/client';
import { CreateFestivoDto } from './dto/create-festivo.dto';

// Festivos nacionales fijos de España (fechas no variables)
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

function calcularViernesSanto(anio: number): Date {
  // Algoritmo de Gauss para calcular el Domingo de Pascua
  const a = anio % 19;
  const b = anio % 4;
  const c = anio % 7;
  const d = (19 * a + 24) % 30;
  const e = (2 * b + 4 * c + 6 * d + 5) % 7;
  const pascua = new Date(anio, 2, 22 + d + e); // Mes 2 = Marzo
  // Viernes Santo = Pascua - 2 días
  return new Date(pascua.getTime() - 2 * 24 * 60 * 60 * 1000);
}

@Injectable()
export class FestivosService {
  constructor(private readonly prisma: PrismaService) {}

  async getFestivos(anio: number, ccaa?: string, provincia?: string) {
    return this.prisma.festivo.findMany({
      where: {
        anio,
        ...(ccaa && { ccaa }),
        ...(provincia && { provincia }),
      },
      orderBy: { fecha: 'asc' },
    });
  }

  async create(dto: CreateFestivoDto) {
    return this.prisma.festivo.create({
      data: {
        fecha: new Date(dto.fecha + 'T12:00:00'),
        descripcion: dto.descripcion,
        ambito: dto.ambito,
        ccaa: dto.ccaa ?? null,
        provincia: dto.provincia ?? null,
        anio: dto.anio,
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

    const todos = [
      ...FESTIVOS_FIJOS.map(f => ({
        fecha: new Date(anio, f.mes - 1, f.dia, 12, 0, 0),
        descripcion: f.descripcion,
        ambito: AmbitoFestivo.NACIONAL,
        ccaa: null,
        provincia: null,
        anio,
      })),
      {
        fecha: new Date(viernesSanto.getFullYear(), viernesSanto.getMonth(), viernesSanto.getDate(), 12, 0, 0),
        descripcion: 'Viernes Santo',
        ambito: AmbitoFestivo.NACIONAL,
        ccaa: null,
        provincia: null,
        anio,
      },
    ];

    const result = await this.prisma.festivo.createMany({
      data: todos,
      skipDuplicates: false,
    });

    return { importados: result.count, omitidos: todos.length - result.count };
  }

  async tieneNacionales(anio: number): Promise<boolean> {
    const count = await this.prisma.festivo.count({
      where: { anio, ambito: AmbitoFestivo.NACIONAL },
    });
    return count > 0;
  }
}
