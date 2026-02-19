import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateObjetivoGeneralDto, UpdateObjetivoGeneralDto } from './dto/objetivo-general.dto';

@Injectable()
export class ObjetivosGeneralesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un objetivo general
   */
  async create(dto: CreateObjetivoGeneralDto) {
    try {
      // Verificar que el área existe
      const area = await this.prisma.areaDesarrollo.findUnique({
        where: { id: dto.areaDesarrolloId },
      });

      if (!area) {
        throw new NotFoundException(`Área con ID ${dto.areaDesarrolloId} no encontrada`);
      }

      return await this.prisma.objetivoGeneral.create({
        data: {
          titulo: dto.titulo,
          descripcion: dto.descripcion,
          areaDesarrolloId: dto.areaDesarrolloId,
        },
        include: {
          areaDesarrollo: true,
        },
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Error al crear objetivo general: ${err.message}`);
    }
  }

  /**
   * Obtener todos los objetivos generales
   */
  async findAll(incluirInactivos: boolean = false) {
    try {
      return await this.prisma.objetivoGeneral.findMany({
        where: incluirInactivos ? {} : { activo: true },
        include: {
          areaDesarrollo: true,
          _count: {
            select: {
              clientesQueLoTienen: true,
              registrosDondeSeTrabajo: true,
            },
          },
        },
        orderBy: [
          { areaDesarrollo: { orden: 'asc' } },
          { titulo: 'asc' },
        ],
      });
    } catch (err) {
      throw new InternalServerErrorException(`Error al obtener objetivos: ${err.message}`);
    }
  }

  /**
   * Obtener objetivos por área
   */
  async findByArea(areaId: string) {
    try {
      return await this.prisma.objetivoGeneral.findMany({
        where: {
          areaDesarrolloId: areaId,
          activo: true,
        },
        include: {
          areaDesarrollo: true,
        },
        orderBy: { titulo: 'asc' },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al obtener objetivos del área: ${err.message}`,
      );
    }
  }

  /**
   * Obtener un objetivo por ID
   */
  async findOne(id: string) {
    try {
      const objetivo = await this.prisma.objetivoGeneral.findUnique({
        where: { id },
        include: {
          areaDesarrollo: true,
          _count: {
            select: {
              clientesQueLoTienen: true,
              registrosDondeSeTrabajo: true,
            },
          },
        },
      });

      if (!objetivo) {
        throw new NotFoundException(`Objetivo con ID ${id} no encontrado`);
      }

      return objetivo;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Error al obtener objetivo: ${err.message}`);
    }
  }

  /**
   * Actualizar un objetivo
   */
  async update(id: string, dto: UpdateObjetivoGeneralDto) {
    try {
      const objetivo = await this.prisma.objetivoGeneral.findUnique({
        where: { id },
      });

      if (!objetivo) {
        throw new NotFoundException(`Objetivo con ID ${id} no encontrado`);
      }

      if (dto.areaDesarrolloId) {
        const area = await this.prisma.areaDesarrollo.findUnique({
          where: { id: dto.areaDesarrolloId },
        });

        if (!area) {
          throw new NotFoundException(`Área con ID ${dto.areaDesarrolloId} no encontrada`);
        }
      }

      return await this.prisma.objetivoGeneral.update({
        where: { id },
        data: {
          ...(dto.titulo && { titulo: dto.titulo }),
          ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
          ...(dto.areaDesarrolloId && { areaDesarrolloId: dto.areaDesarrolloId }),
          ...(dto.activo !== undefined && { activo: dto.activo }),
        },
        include: {
          areaDesarrollo: true,
        },
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Error al actualizar objetivo: ${err.message}`);
    }
  }

  /**
   * Eliminar un objetivo
   */
  async remove(id: string) {
    try {
      const objetivo = await this.prisma.objetivoGeneral.findUnique({
        where: { id },
        include: {
          clientesQueLoTienen: true,
        },
      });

      if (!objetivo) {
        throw new NotFoundException(`Objetivo con ID ${id} no encontrado`);
      }

      if (objetivo.clientesQueLoTienen.length > 0) {
        throw new ConflictException(
          `No se puede eliminar "${objetivo.titulo}" porque está asignado a ${objetivo.clientesQueLoTienen.length} cliente(s)`,
        );
      }

      await this.prisma.objetivoGeneral.delete({
        where: { id },
      });

      return {
        message: `Objetivo "${objetivo.titulo}" eliminado correctamente`,
      };
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ConflictException) {
        throw err;
      }
      throw new InternalServerErrorException(`Error al eliminar objetivo: ${err.message}`);
    }
  }

  /**
   * Seed de objetivos generales por defecto
   */
  async seed() {
    try {
      // Obtener áreas
      const areas = await this.prisma.areaDesarrollo.findMany();

      if (areas.length === 0) {
        throw new Error('Primero debes crear las áreas de desarrollo con POST /areas-desarrollo/seed');
      }

      const objetivosDefault: Record<string, string[]> = {
        'Comprensión Lectora': [
          'Comprensión Literal',
          'Comprensión Inferencial',
          'Comprensión Crítica',
          'Comprensión Reorganizativa',
        ],
        'Expresión Escrita': [
          'Caligrafía',
          'Ortografía',
          'Redacción de Textos',
          'Composición Escrita',
        ],
        'Cálculo Matemático': [
          'Operaciones Básicas',
          'Cálculo Mental',
          'Resolución de Problemas',
          'Razonamiento Numérico',
        ],
        'Atención y Concentración': [
          'Atención Sostenida',
          'Atención Selectiva',
          'Atención Dividida',
          'Control Atencional',
        ],
        'Funciones Ejecutivas': [
          'Planificación',
          'Organización',
          'Flexibilidad Cognitiva',
          'Autorregulación',
          'Inhibición',
        ],
        'Lenguaje Oral': [
          'Expresión Oral',
          'Comprensión Oral',
          'Vocabulario',
          'Articulación',
        ],
        'Grafomotricidad': [
          'Motricidad Fina',
          'Coordinación Óculo-Manual',
          'Trazo',
          'Prensión',
        ],
        'Memoria': [
          'Memoria a Corto Plazo',
          'Memoria de Trabajo',
          'Memoria a Largo Plazo',
          'Memoria Visual',
        ],
        'Razonamiento Lógico': [
          'Pensamiento Lógico',
          'Secuencias',
          'Clasificación',
          'Analogías',
        ],
        'Habilidades Sociales': [
          'Comunicación Interpersonal',
          'Empatía',
          'Resolución de Conflictos',
          'Trabajo en Equipo',
        ],
      };

      const objetivosCreados: any = [];
      const objetivosExistentes: any = [];

      for (const area of areas) {
        const objetivosDelArea = objetivosDefault[area.nombre] || [];

        for (const tituloObjetivo of objetivosDelArea) {
          const existe = await this.prisma.objetivoGeneral.findFirst({
            where: {
              titulo: tituloObjetivo,
              areaDesarrolloId: area.id,
            },
          });

          if (existe) {
            objetivosExistentes.push(`${area.nombre} → ${tituloObjetivo}`);
          } else {
            await this.prisma.objetivoGeneral.create({
              data: {
                titulo: tituloObjetivo,
                areaDesarrolloId: area.id,
              },
            });
            objetivosCreados.push(`${area.nombre} → ${tituloObjetivo}`);
          }
        }
      }

      return {
        message: 'Objetivos generales procesados',
        objetivosCreados,
        objetivosExistentes,
        totalCreados: objetivosCreados.length,
        totalExistentes: objetivosExistentes.length,
      };
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al crear objetivos por defecto: ${err.message}`,
      );
    }
  }
}