import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateObjetivoGeneralDto,
  UpdateObjetivoGeneralDto,
} from './dto/objetivo-general.dto';

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
        throw new NotFoundException(
          `Área con ID ${dto.areaDesarrolloId} no encontrada`,
        );
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
      throw new InternalServerErrorException(
        `Error al crear objetivo general: ${err.message}`,
      );
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
        orderBy: [{ areaDesarrollo: { orden: 'asc' } }, { titulo: 'asc' }],
      });
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al obtener objetivos: ${err.message}`,
      );
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
      throw new InternalServerErrorException(
        `Error al obtener objetivo: ${err.message}`,
      );
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
          throw new NotFoundException(
            `Área con ID ${dto.areaDesarrolloId} no encontrada`,
          );
        }
      }

      return await this.prisma.objetivoGeneral.update({
        where: { id },
        data: {
          ...(dto.titulo && { titulo: dto.titulo }),
          ...(dto.descripcion !== undefined && {
            descripcion: dto.descripcion,
          }),
          ...(dto.areaDesarrolloId && {
            areaDesarrolloId: dto.areaDesarrolloId,
          }),
          ...(dto.activo !== undefined && { activo: dto.activo }),
        },
        include: {
          areaDesarrollo: true,
        },
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        `Error al actualizar objetivo: ${err.message}`,
      );
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
      if (
        err instanceof NotFoundException ||
        err instanceof ConflictException
      ) {
        throw err;
      }
      throw new InternalServerErrorException(
        `Error al eliminar objetivo: ${err.message}`,
      );
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
        throw new Error(
          'Primero debes crear las áreas de desarrollo con POST /areas-desarrollo/seed',
        );
      }

      const objetivosDefault: Record<string, string[]> = {
        'Procesos Cognitivos Básicos': [
          'Atención Dividida',
          'Atención Sostenida',
          'Atención Visual',
          'Atención Auditiva',
          'Memoria Episódica',
          'Memoria Espacial',
          'Memoria Procedimental',
          'MLP Visual',
          'MLP Auditiva',
          'Visión Espacial'
        ],
        'Funciones Ejecutivas': [
          'Memoria de Trabajo Visual',
          'Memoria de Trabajo Auditiva',
          'Memoria Semántica',
          'Velocidad de Procesamiento',
          'Inhibición',
          'Atención Selectiva',
          'Control Atencional',
          'Flexibilidad Cognitiva',
          'Razonamiento',
          'Planificación',
        ],
        'Lectura': [
          'Conciencia Fonológica',
          'Conciencia Fonémica',
          'Conciencia Silábica',
          'Conciencia Léxica',
          'Correspondencia Grafema-Fonema',
          'Lectura Ruta Léxica',
          'Lectura Ruta Fonológica',
          'Precisión Lectora',
          'Velocidad Lectora',
          'Fluidez Lectora',
          'Entonación y Prosodia',
          'Comprension Lectora',
          'Comprensión Lectora de Instrucciones',
          'Comprensión Lectora Literal',
          'Comprensión Lectora Inferencial',
        ],
        'Escritura': [
          'Correspondencia Fonema-Grafema',
          'Tamaño y Forma de las Letras',
          'Legibilidad',
          'Velocidad de Escritura',
          'Ortografía Natural',
          'Ortografía Arbitraria',
          'Ortografía Reglada',
          'Signos de Puntuación',
          'Construcción de Frases',
          'Cohesión',
          'Coherencia',
          'Dictado',
          'Copia Escrita',
          'Expresión Escrita',
        ],
        'Lenguaje y Comunicación': [
          'Comprensión Verbal',
          'Expresión Oral',
          'Narración',
          'Vocabulario',
          'Uso del Lenguaje para Pedir Ayuda',
          'Uso del Lenguaje para Explicar Dificultades',
        ],
        'Matemáticas': [
          'Comprensión de Consignas Matemáticas',
          'Resolución de Problemas',
          'Uso de Estrategias',
        ],
        'Técnicas de Estudio': [
          'Hábito de Estudio',
          'Organización del Contenido Curricular',
          'Planificación de Tareas Académicas',
          'Uso Funcional de la Agenda',
          'Secuenciación de Tareas',
          'Gestión del Tiempo y Pausas Funcionales',
          'Inicio Autónomo',
          'Persistencia ante la Dificultad',
          'Lectura Comprensiva de Textos de Estudio',
          'Síntesis y Organización de la Información',
          'Identificación de Ideas Principales',
          'Subrayado Funcional',
          'Mapas Conceptuales',
          'Jerarquización de Ideas Principales',
          'Resúmenes',
          'Representaciones Gráficas',
          'Uso de Reglas Mnemotécnicas',
          'Autoevaluación',
        ],
        'Emociones': [
          'Identificación Emociones',
          'Expresión Emociones'
        ]
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
