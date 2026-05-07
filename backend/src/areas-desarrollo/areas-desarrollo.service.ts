import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAreaDesarrolloDto, UpdateAreaDesarrolloDto } from './dto/area-desarrollo.dto';

@Injectable()
export class AreasDesarrolloService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un área de desarrollo
   */
  async create(dto: CreateAreaDesarrolloDto) {
    try {
      const existente = await this.prisma.areaDesarrollo.findUnique({
        where: { nombre: dto.nombre },
      });

      if (existente) {
        throw new ConflictException(`El área "${dto.nombre}" ya existe`);
      }

      return await this.prisma.areaDesarrollo.create({
        data: {
          nombre: dto.nombre,
          descripcion: dto.descripcion,
          color: dto.color,
          orden: dto.orden ?? 0,
        },
      });
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException(`Error al crear área: ${err.message}`);
    }
  }

  /**
   * Obtener todas las áreas
   */
  async findAll(incluirInactivas: boolean = false) {
    try {
      return await this.prisma.areaDesarrollo.findMany({
        where: incluirInactivas ? {} : { activo: true },
        include: {
          _count: {
            select: {
              objetivosGenerales: true,
            },
          },
        },
        orderBy: { orden: 'asc' },
      });
    } catch (err) {
      throw new InternalServerErrorException(`Error al obtener áreas: ${err.message}`);
    }
  }

  /**
   * Obtener un área por ID
   */
  async findOne(id: string) {
    try {
      const area = await this.prisma.areaDesarrollo.findUnique({
        where: { id },
        include: {
          objetivosGenerales: {
            where: { activo: true },
            orderBy: { titulo: 'asc' },
          },
        },
      });

      if (!area) {
        throw new NotFoundException(`Área con ID ${id} no encontrada`);
      }

      return area;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Error al obtener área: ${err.message}`);
    }
  }

  /**
   * Actualizar un área
   */
  async update(id: string, dto: UpdateAreaDesarrolloDto) {
    try {
      const area = await this.prisma.areaDesarrollo.findUnique({
        where: { id },
      });

      if (!area) {
        throw new NotFoundException(`Área con ID ${id} no encontrada`);
      }

      if (dto.nombre && dto.nombre !== area.nombre) {
        const existente = await this.prisma.areaDesarrollo.findUnique({
          where: { nombre: dto.nombre },
        });

        if (existente) {
          throw new ConflictException(`El área "${dto.nombre}" ya existe`);
        }
      }

      return await this.prisma.areaDesarrollo.update({
        where: { id },
        data: {
          ...(dto.nombre && { nombre: dto.nombre }),
          ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
          ...(dto.color !== undefined && { color: dto.color }),
          ...(dto.orden !== undefined && { orden: dto.orden }),
          ...(dto.activo !== undefined && { activo: dto.activo }),
        },
      });
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ConflictException) {
        throw err;
      }
      throw new InternalServerErrorException(`Error al actualizar área: ${err.message}`);
    }
  }

  /**
   * Eliminar un área
   */
  async remove(id: string) {
    try {
      const area = await this.prisma.areaDesarrollo.findUnique({
        where: { id },
        include: {
          objetivosGenerales: true,
        },
      });

      if (!area) {
        throw new NotFoundException(`Área con ID ${id} no encontrada`);
      }

      if (area.objetivosGenerales.length > 0) {
        throw new ConflictException(
          `No se puede eliminar el área "${area.nombre}" porque tiene ${area.objetivosGenerales.length} objetivo(s) asociado(s)`,
        );
      }

      await this.prisma.areaDesarrollo.delete({
        where: { id },
      });

      return {
        message: `Área "${area.nombre}" eliminada correctamente`,
      };
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ConflictException) {
        throw err;
      }
      throw new InternalServerErrorException(`Error al eliminar área: ${err.message}`);
    }
  }

  /**
   * Crear áreas por defecto (seed)
   */
  async seed() {
    try {
      const areasDefault = [
        {
          nombre: 'Procesos Cognitivos Básicos',
          descripcion: 'Atención, memoria y percepción',
          color: '#6366F1',
          orden: 1,
        },
        {
          nombre: 'Funciones Ejecutivas',
          descripcion: 'Planificación, inhibición y flexibilidad cognitiva',
          color: '#EF4444',
          orden: 2,
        },
        {
          nombre: 'Lectura',
          descripcion: 'Conciencia fonológica, decodificación y comprensión lectora',
          color: '#3B82F6',
          orden: 3,
        },
        {
          nombre: 'Escritura',
          descripcion: 'Grafomotricidad, ortografía y expresión escrita',
          color: '#8B5CF6',
          orden: 4,
        },
        {
          nombre: 'Lenguaje y Comunicación',
          descripcion: 'Expresión oral, comprensión verbal y vocabulario',
          color: '#EC4899',
          orden: 5,
        },
        {
          nombre: 'Matemáticas',
          descripcion: 'Cálculo, razonamiento y resolución de problemas',
          color: '#F59E0B',
          orden: 6,
        },
        {
          nombre: 'Técnicas de Estudio',
          descripcion: 'Organización, planificación y hábitos de estudio',
          color: '#10B981',
          orden: 7,
        },
        {
          nombre: 'Emociones',
          descripcion: 'Identificación y expresión emocional',
          color: '#F97316',
          orden: 8,
        },
      ];

      const areasCreadas: any = [];
      const areasExistentes: any = [];

      for (const areaData of areasDefault) {
        const existe = await this.prisma.areaDesarrollo.findUnique({
          where: { nombre: areaData.nombre },
        });

        if (existe) {
          areasExistentes.push(existe.nombre);
        } else {
          const nuevaArea = await this.prisma.areaDesarrollo.create({
            data: areaData,
          });
          areasCreadas.push(nuevaArea.nombre);
        }
      }

      return {
        message: 'Áreas de desarrollo procesadas',
        areasCreadas,
        areasExistentes,
        totalCreadas: areasCreadas.length,
        totalExistentes: areasExistentes.length,
      };
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al crear áreas por defecto: ${err.message}`,
      );
    }
  }
}