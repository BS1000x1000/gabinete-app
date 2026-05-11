import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EstadoContrato, EstadoFactura, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../common/storage/r2.service';
import { FacturasPdfService } from './facturas-pdf.service';
import { MarcarPagadaDto } from './dto/marcar-pagada.dto';
import { CrearFacturaPuntualDto } from './dto/crear-factura-puntual.dto';
import { toNum } from './facturas.utils';
import { EmailService } from '../common/email/email.service';

const EXENCION_IVA = 'Exenta de IVA conforme al Art. 20.1.3 LIVA';

const facturaInclude = {
  trabajador: {
    select: {
      id: true,
      nombre: true,
      apellidos: true,
      nombreFiscal: true,
      nifFiscal: true,
      direccionFiscal: true,
      codigoPostalFiscal: true,
      ciudadFiscal: true,
      provinciaFiscal: true,
      iban: true,
      emailFacturacion: true,
      email: true,
    },
  },
  cliente: {
    select: {
      id: true,
      nombre: true,
      apellidos: true,
      nifTutorPagador: true,
      nombreTutorPagador: true,
      direccionFiscalTutor: true,
      codigoPostalTutor: true,
      ciudadTutor: true,
      emailFacturacion: true,
    },
  },
  contrato: { select: { id: true, tipoSesion: true } },
} satisfies Prisma.FacturaInclude;

type FacturaCompleta = Prisma.FacturaGetPayload<{ include: typeof facturaInclude }>;

@Injectable()
export class FacturasService {
  private readonly logger = new Logger(FacturasService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly r2: R2Service,
    private readonly pdfService: FacturasPdfService,
    private readonly emailService: EmailService,
  ) {}

  async asignarNumeroCorrelativo(
    tx: Prisma.TransactionClient,
    trabajadorId: string,
    anio: number,
  ): Promise<{ numero: number; numeroFormateado: string }> {
    const contador = await tx.contadorFactura.upsert({
      where: { trabajadorId_anio: { trabajadorId, anio } },
      update: { ultimoNumero: { increment: 1 } },
      create: { trabajadorId, anio, ultimoNumero: 1 },
    });
    return {
      numero: contador.ultimoNumero,
      numeroFormateado: `${contador.ultimoNumero}/${anio}`,
    };
  }

  async generarFacturasMes(anio: number, mes: number): Promise<number> {
    const primerDia = new Date(anio, mes - 1, 1);
    const ultimoDia = new Date(anio, mes, 0, 23, 59, 59);

    const contratosActivos = await this.prisma.contratoServicio.findMany({
      where: {
        estado: EstadoContrato.ACTIVO,
        fechaInicio: { lte: ultimoDia },
        OR: [{ fechaFin: null }, { fechaFin: { gte: primerDia } }],
      },
      include: {
        trabajador: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            nombreFiscal: true,
            nifFiscal: true,
            retencionIrpf: true,
          },
        },
        cliente: {
          select: { id: true, nombre: true, apellidos: true },
        },
      },
    });

    const periodoFacturado = this.formatPeriodo(anio, mes);
    const mesNombre = new Date(anio, mes - 1, 1).toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    });

    // Pre-load all existing facturas for this period in one query to avoid N+1
    const facturasExistentes = await this.prisma.factura.findMany({
      where: {
        periodoFacturado,
        contratoId: { in: contratosActivos.map((c) => c.id) },
      },
      select: { contratoId: true },
    });
    const yaFacturados = new Set(facturasExistentes.map((f) => f.contratoId));

    let creadas = 0;
    for (const contrato of contratosActivos) {
      if (yaFacturados.has(contrato.id)) continue;

      try {
        await this.crearFacturaDesdeContrato(contrato, anio, mesNombre, periodoFacturado);
        creadas++;
      } catch (err) {
        this.logger.error(
          `Error generando factura contrato ${contrato.id} para ${periodoFacturado}: ${err}`,
        );
      }
    }

    this.logger.log(`Mes ${periodoFacturado}: ${creadas} facturas creadas`);
    return creadas;
  }

  private async crearFacturaDesdeContrato(
    contrato: {
      id: string;
      clienteId: string;
      trabajadorId: string;
      cuotaMensual: { toNumber: () => number } | number;
      tipoSesion: string;
      trabajador: { retencionIrpf: { toNumber: () => number } | null | number };
    },
    anio: number,
    mesNombre: string,
    periodoFacturado: string,
  ): Promise<void> {
    const importe = toNum(contrato.cuotaMensual);
    const retencionPct = toNum(contrato.trabajador.retencionIrpf);
    const retencionImporte = (importe * retencionPct) / 100;
    const total = importe - retencionImporte;
    const concepto = `Cuota mensual de ${contrato.tipoSesion.toLowerCase()} — ${mesNombre}`;

    const factura = await this.prisma.$transaction(async (tx) => {
      const { numero, numeroFormateado } = await this.asignarNumeroCorrelativo(
        tx,
        contrato.trabajadorId,
        anio,
      );
      return tx.factura.create({
        data: {
          numero,
          numeroFormateado,
          anio,
          trabajadorId: contrato.trabajadorId,
          clienteId: contrato.clienteId,
          contratoId: contrato.id,
          fechaEmision: new Date(),
          periodoFacturado,
          concepto,
          importe,
          ivaPorcentaje: 0,
          ivaImporte: 0,
          retencionPorcentaje: retencionPct,
          retencionImporte,
          exencionIvaTexto: EXENCION_IVA,
          total,
          estado: EstadoFactura.PENDIENTE,
        },
        include: facturaInclude,
      });
    });

    this.archivarPdfEnR2(factura).catch((err) =>
      this.logger.error(`Error generando PDF factura ${factura.id}: ${err}`),
    );
  }

  private async archivarPdfEnR2(factura: FacturaCompleta): Promise<void> {
    if (!this.r2.isConfigured) {
      this.logger.warn(`R2 no configurado — PDF factura ${factura.id} no archivado`);
      return;
    }
    const buffer = await this.pdfService.generarPdf(factura);
    const key = `facturas/${factura.trabajadorId}/${factura.anio}/${factura.numero}.pdf`;
    const url = await this.r2.upload(key, buffer, 'application/pdf');
    if (url) {
      await this.prisma.factura.update({
        where: { id: factura.id },
        data: { urlPdfR2: key },
      });
    }
  }

  async generarPdfBuffer(
    facturaId: string,
    user: { userId: string; rol: string },
  ): Promise<Buffer> {
    const factura = await this.findOneOrThrow(facturaId, user);
    return this.pdfService.generarPdf(factura);
  }

  async regenerarPdf(facturaId: string, user: { userId: string; rol: string }): Promise<void> {
    const factura = await this.findOneOrThrow(facturaId, user);
    await this.archivarPdfEnR2(factura);
  }

  async findAll(
    user: { userId: string; rol: string },
    filters?: { anio?: number; mes?: number; clienteId?: string; estado?: EstadoFactura },
  ) {
    const where: Prisma.FacturaWhereInput = {};

    if (user.rol !== 'ADMIN') {
      where.trabajadorId = user.userId;
    }

    if (filters?.anio) where.anio = filters.anio;
    if (filters?.clienteId) where.clienteId = filters.clienteId;
    if (filters?.estado) where.estado = filters.estado;
    if (filters?.mes) {
      where.periodoFacturado = this.formatPeriodo(
        filters.anio ?? new Date().getFullYear(),
        filters.mes,
      );
    }

    return this.prisma.factura.findMany({
      where,
      include: facturaInclude,
      orderBy: [{ anio: 'desc' }, { numero: 'desc' }],
    });
  }

  async findOne(facturaId: string, user: { userId: string; rol: string }) {
    return this.findOneOrThrow(facturaId, user);
  }

  private async findOneOrThrow(
    facturaId: string,
    user: { userId: string; rol: string },
  ): Promise<FacturaCompleta> {
    const factura = await this.prisma.factura.findUnique({
      where: { id: facturaId },
      include: facturaInclude,
    });

    if (!factura) throw new NotFoundException(`Factura ${facturaId} no encontrada`);

    if (user.rol !== 'ADMIN' && factura.trabajadorId !== user.userId) {
      throw new NotFoundException(`Factura ${facturaId} no encontrada`);
    }

    return factura;
  }

  async marcarPagada(
    facturaId: string,
    dto: MarcarPagadaDto,
    user: { userId: string; rol: string },
  ) {
    const factura = await this.findOneOrThrow(facturaId, user);

    if (factura.estado === EstadoFactura.ANULADA) {
      throw new ForbiddenException('No se puede marcar como pagada una factura anulada');
    }

    return this.prisma.factura.update({
      where: { id: facturaId },
      data: {
        estado: EstadoFactura.PAGADA,
        fechaPago: new Date(dto.fechaPago),
        metodoPago: dto.metodoPago ?? null,
      },
      include: facturaInclude,
    });
  }

  async anular(facturaId: string, user: { userId: string; rol: string }) {
    const factura = await this.findOneOrThrow(facturaId, user);

    if (factura.estado === EstadoFactura.ANULADA) {
      throw new ForbiddenException('La factura ya está anulada');
    }

    return this.prisma.factura.update({
      where: { id: facturaId },
      data: { estado: EstadoFactura.ANULADA },
      include: facturaInclude,
    });
  }

  async crearFacturaPuntual(
    dto: CrearFacturaPuntualDto,
    user: { userId: string; rol: string },
  ) {
    const trabajadorId = user.userId;
    const trabajador = await this.prisma.trabajador.findUnique({
      where: { id: trabajadorId },
      select: { retencionIrpf: true },
    });

    if (!trabajador) {
      throw new NotFoundException(`Trabajador ${trabajadorId} no encontrado`);
    }

    const anio = new Date(dto.fechaEmision).getFullYear();
    const retencionPct = toNum(trabajador.retencionIrpf);
    const retencionImporte = (dto.importe * retencionPct) / 100;
    const total = dto.importe - retencionImporte;

    const factura = await this.prisma.$transaction(async (tx) => {
      const { numero, numeroFormateado } = await this.asignarNumeroCorrelativo(
        tx,
        trabajadorId,
        anio,
      );
      return tx.factura.create({
        data: {
          numero,
          numeroFormateado,
          anio,
          trabajadorId,
          clienteId: dto.clienteId,
          contratoId: dto.contratoId ?? null,
          fechaEmision: new Date(dto.fechaEmision),
          periodoFacturado: dto.periodoFacturado,
          concepto: dto.concepto,
          importe: dto.importe,
          ivaPorcentaje: 0,
          ivaImporte: 0,
          retencionPorcentaje: retencionPct,
          retencionImporte,
          exencionIvaTexto: EXENCION_IVA,
          total,
          estado: EstadoFactura.PENDIENTE,
        },
        include: facturaInclude,
      });
    });

    this.archivarPdfEnR2(factura).catch((err) =>
      this.logger.error(`Error generando PDF factura puntual ${factura.id}: ${err}`),
    );

    return factura;
  }

  private formatPeriodo(anio: number, mes: number): string {
    return `${anio}-${String(mes).padStart(2, '0')}`;
  }

  async enviarEmailsPendientes(anio: number, mes: number): Promise<number> {
    const periodoFacturado = this.formatPeriodo(anio, mes);

    const facturas = await this.prisma.factura.findMany({
      where: {
        emailEnviado: false,
        periodoFacturado,
        urlPdfR2: { not: null },
        estado: { not: EstadoFactura.ANULADA },
      },
      include: facturaInclude,
    });

    let enviados = 0;
    for (const factura of facturas) {
      const ok = await this.enviarEmailFactura(factura);
      if (ok) enviados++;
    }

    this.logger.log(`Emails factura ${periodoFacturado}: ${enviados}/${facturas.length} enviados`);
    return enviados;
  }

  async reenviarEmail(
    facturaId: string,
    user: { userId: string; rol: string },
  ): Promise<{ enviado: boolean }> {
    const factura = await this.findOneOrThrow(facturaId, user);
    const enviado = await this.enviarEmailFactura(factura);
    return { enviado };
  }

  private async enviarEmailFactura(factura: FacturaCompleta): Promise<boolean> {
    if (!this.emailService.isConfigured) return false;

    const emailDestino = factura.cliente.emailFacturacion ?? null;

    if (!emailDestino) {
      this.logger.warn(`Factura ${factura.id}: cliente sin email — no se envía`);
      return false;
    }

    const replyTo =
      factura.trabajador.emailFacturacion ?? factura.trabajador.email;

    const nombreTrabajador =
      factura.trabajador.nombreFiscal ??
      `${factura.trabajador.nombre} ${factura.trabajador.apellidos}`;

    const pdfBuffer = await this.pdfService.generarPdf(factura).catch((err) => {
      this.logger.error(`Error generando PDF para email factura ${factura.id}: ${err}`);
      return null;
    });
    if (!pdfBuffer) return false;

    const enviado = await this.emailService.sendFacturaEmail({
      to: emailDestino,
      replyTo,
      nombreTrabajador,
      numeroFormateado: factura.numeroFormateado,
      periodoFacturado: factura.periodoFacturado,
      concepto: factura.concepto,
      total: toNum(factura.total).toFixed(2).replace('.', ','),
      pdfBuffer,
      pdfFilename: `Factura_${factura.numeroFormateado.replace('/', '-')}.pdf`,
    });

    if (enviado) {
      await this.prisma.factura.update({
        where: { id: factura.id },
        data: { emailEnviado: true, fechaEnvioEmail: new Date() },
      });
    }

    return enviado;
  }
}
