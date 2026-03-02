import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBonoDto } from './dto/create-bono.dto';
import { RegistrarPagoDto } from './dto/registrar-pago.dto';
import { EstadoBono } from '@prisma/client';

@Injectable()
export class BonosService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Crear bono ───────────────────────────────────────────────
  async create(dto: CreateBonoDto) {
    // Validar que no haya un bono ACTIVO para este cliente
    const bonoActivo = await this.prisma.bono.findFirst({
      where: { clienteId: dto.clienteId, estado: 'ACTIVO' },
    });

    if (bonoActivo) {
      throw new ConflictException(
        `El cliente ya tiene un bono activo (ID: ${bonoActivo.id}). Consúmelo antes de crear uno nuevo.`
      );
    }

    return this.prisma.bono.create({
      data: {
        clienteId:      dto.clienteId,
        totalSesiones:  dto.totalSesiones,
        precio:         dto.precio,
        familiarPagoId: dto.familiarPagoId,
        notas:          dto.notas,
      },
      include: { familiarPago: true },
    });
  }

  // ─── Obtener bonos de un cliente ──────────────────────────────
  async findByCliente(clienteId: string) {
    return this.prisma.bono.findMany({
      where: { clienteId },
      orderBy: { createdAt: 'desc' },
      include: {
        familiarPago: { select: { id: true, nombre: true, apellidos: true } },
        sesiones: {
          select: { id: true, fechaHoraInicio: true, estado: true },
          orderBy: { fechaHoraInicio: 'desc' },
        },
      },
    });
  }

  // ─── Bono activo de un cliente (usado por SesionesService) ────
  async findActivoByCliente(clienteId: string) {
    return this.prisma.bono.findFirst({
      where: { clienteId, estado: 'ACTIVO' },
    });
  }

  // ─── Registrar pago ───────────────────────────────────────────
  async registrarPago(id: string, dto: RegistrarPagoDto) {
    const bono = await this.prisma.bono.findUnique({ where: { id } });
    if (!bono) throw new NotFoundException('Bono no encontrado');
    if (bono.pagado) throw new BadRequestException('Este bono ya está pagado');

    return this.prisma.bono.update({
      where: { id },
      data: {
        pagado:     true,
        metodoPago: dto.metodoPago,
        fechaPago:  dto.fechaPago ? new Date(dto.fechaPago) : new Date(),
      },
    });
  }

  // ─── Cancelar bono ────────────────────────────────────────────
  async cancelar(id: string) {
    const bono = await this.prisma.bono.findUnique({ where: { id } });
    if (!bono) throw new NotFoundException('Bono no encontrado');
    if (bono.estado === 'CONSUMIDO') throw new BadRequestException('No se puede cancelar un bono ya consumido');

    return this.prisma.bono.update({
      where: { id },
      data: { estado: 'CANCELADO', fechaFin: new Date() },
    });
  }

  // ─── Panel admin: cobros pendientes ───────────────────────────
  async getCobrosPendientes() {
    return this.prisma.bono.findMany({
      where: { estado: 'CONSUMIDO', pagado: false },
      orderBy: { updatedAt: 'desc' },
      include: {
        cliente:     { select: { id: true, nombre: true, apellidos: true } },
        familiarPago: { select: { nombre: true, apellidos: true, telefono: true } },
      },
    });
  }

  // ─── Descuento de sesión (llamado INTERNAMENTE por SesionesService) ─
  /**
   * @transaccional — se ejecuta dentro de la transacción de completar sesión.
   * Devuelve el bono actualizado o null si no había bono activo.
   */
  async descontarSesion(
    clienteId: string,
    sesionId: string,
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0]
  ) {
    const bono = await tx.bono.findFirst({
      where: { clienteId, estado: 'ACTIVO' },
    });

    if (!bono) return null; // La sesión se completa, pero sin bono

    const nuevasConsumidas = bono.sesionesConsumidas + 1;
    const nuevoEstado: EstadoBono =
      nuevasConsumidas >= bono.totalSesiones ? 'CONSUMIDO' : 'ACTIVO';

    const bonoActualizado = await tx.bono.update({
      where: { id: bono.id },
      data: {
        sesionesConsumidas: nuevasConsumidas,
        estado:  nuevoEstado,
        fechaFin: nuevoEstado === 'CONSUMIDO' ? new Date() : undefined,
        sesiones: { connect: { id: sesionId } },
      },
    });

    return bonoActualizado;
  }
}