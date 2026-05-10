import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoSesion } from '@prisma/client';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';

const CONTRATO_INCLUDE = {
  cliente: { select: { id: true, nombre: true, apellidos: true } },
  trabajador: { select: { id: true, nombre: true, apellidos: true, especialidad: true } },
  _count: { select: { sesiones: true } },
} as const;

@Injectable()
export class ContratosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContratoDto, user: { userId: string; rol: string }) {
    const trabajadorId = user.rol === 'ADMIN' && dto.trabajadorId
      ? dto.trabajadorId
      : user.userId;

    // Validar que no exista ya un contrato ACTIVO para la misma pareja + tipoSesion
    const existente = await this.prisma.contratoServicio.findFirst({
      where: {
        clienteId: dto.clienteId,
        trabajadorId,
        tipoSesion: dto.tipoSesion,
        estado: { in: ['ACTIVO', 'BORRADOR'] },
      },
    });
    if (existente) {
      throw new BadRequestException(
        `Ya existe un contrato activo para esta pareja cliente-terapeuta con tipo ${dto.tipoSesion}`,
      );
    }

    return this.prisma.contratoServicio.create({
      data: {
        clienteId: dto.clienteId,
        trabajadorId,
        tipoSesion: dto.tipoSesion,
        cuotaMensual: dto.cuotaMensual,
        diaSemana: dto.diaSemana,
        horaInicio: dto.horaInicio,
        horaFin: dto.horaFin,
        duracionMinutos: dto.duracionMinutos,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
        notas: dto.notas,
        estado: 'ACTIVO',
      },
      include: CONTRATO_INCLUDE,
    });
  }

  async findAll(user: { userId: string; rol: string }) {
    const where = user.rol === 'ADMIN'
      ? {}
      : { trabajadorId: user.userId };

    return this.prisma.contratoServicio.findMany({
      where,
      include: CONTRATO_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCliente(clienteId: string, user: { userId: string; rol: string }) {
    const where: any = { clienteId };
    if (user.rol !== 'ADMIN' && user.rol !== 'RECEP') {
      where.trabajadorId = user.userId;
    }

    return this.prisma.contratoServicio.findMany({
      where,
      include: CONTRATO_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: { userId: string; rol: string }) {
    const contrato = await this.prisma.contratoServicio.findUnique({
      where: { id },
      include: CONTRATO_INCLUDE,
    });

    if (!contrato) throw new NotFoundException(`Contrato ${id} no encontrado`);
    this.checkAcceso(contrato, user);
    return contrato;
  }

  async update(id: string, dto: UpdateContratoDto, user: { userId: string; rol: string }) {
    const contrato = await this.prisma.contratoServicio.findUnique({ where: { id } });
    if (!contrato) throw new NotFoundException(`Contrato ${id} no encontrado`);
    this.checkAcceso(contrato, user);

    if (contrato.estado === 'FINALIZADO') {
      throw new BadRequestException('No se puede editar un contrato finalizado');
    }

    return this.prisma.contratoServicio.update({
      where: { id },
      data: {
        ...(dto.cuotaMensual !== undefined && { cuotaMensual: dto.cuotaMensual }),
        ...(dto.diaSemana !== undefined && { diaSemana: dto.diaSemana }),
        ...(dto.horaInicio !== undefined && { horaInicio: dto.horaInicio }),
        ...(dto.horaFin !== undefined && { horaFin: dto.horaFin }),
        ...(dto.duracionMinutos !== undefined && { duracionMinutos: dto.duracionMinutos }),
        ...(dto.fechaFin !== undefined && { fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null }),
        ...(dto.notas !== undefined && { notas: dto.notas }),
      },
      include: CONTRATO_INCLUDE,
    });
  }

  async finalizar(id: string, user: { userId: string; rol: string }) {
    const contrato = await this.prisma.contratoServicio.findUnique({ where: { id } });
    if (!contrato) throw new NotFoundException(`Contrato ${id} no encontrado`);
    this.checkAcceso(contrato, user);

    if (contrato.estado === 'FINALIZADO') {
      throw new BadRequestException('El contrato ya está finalizado');
    }

    const ahora = new Date();

    await this.prisma.$transaction([
      // Cancelar sesiones futuras vinculadas al contrato
      this.prisma.sesion.updateMany({
        where: {
          contratoId: id,
          fechaHoraInicio: { gt: ahora },
          estado: 'PROGRAMADA',
        },
        data: { estado: EstadoSesion.CANCELADA_CON_AVISO },
      }),
      // Marcar contrato como finalizado
      this.prisma.contratoServicio.update({
        where: { id },
        data: { estado: 'FINALIZADO', fechaFin: ahora },
      }),
    ]);

    return this.prisma.contratoServicio.findUnique({
      where: { id },
      include: CONTRATO_INCLUDE,
    });
  }

  private checkAcceso(
    contrato: { trabajadorId: string },
    user: { userId: string; rol: string },
  ) {
    if (user.rol !== 'ADMIN' && contrato.trabajadorId !== user.userId) {
      throw new ForbiddenException('No tienes acceso a este contrato');
    }
  }
}
