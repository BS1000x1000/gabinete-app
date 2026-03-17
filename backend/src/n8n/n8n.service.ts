import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { TipoInforme, EstadoInforme } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BonoAlertaItem } from './interface/n8n-automatizaciones.interface';

@Injectable()
export class N8nService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  private toDateStr(date: Date | null | undefined): string | undefined {
    return date?.toISOString().split('T')[0];
  }

  // ============================================================
  // AUTOMATIZACIÓN 1 — Bono agotado
  // Llamado por el cron de n8n cada mañana
  // ============================================================

  async getBonosAlertas(): Promise<BonoAlertaItem[]> {
    const bonos = await this.prisma.bono.findMany({
      where: {
        estado: 'ACTIVO',
        cliente: {
          contactosFamiliares: {
            some: { esResponsablePago: true, email: { not: null } },
          },
        },
      },
      include: {
        cliente: {
          include: {
            contactosFamiliares: {
              where: { esResponsablePago: true, email: { not: null } },
            },
          },
        },
      },
    });

    const alertas: BonoAlertaItem[] = [];

    for (const bono of bonos) {
      const restantes = bono.totalSesiones - bono.sesionesConsumidas;
      if (restantes > 1) continue;

      const responsable = bono.cliente.contactosFamiliares[0];
      if (!responsable) continue;

      alertas.push({
        clienteId: bono.clienteId,
        clienteNombre: bono.cliente.nombre,
        clienteApellidos: bono.cliente.apellidos,
        bonoId: bono.id,
        tipoSesion: bono.tipoSesion,
        sesionesRestantes: restantes,
        emailResponsable: responsable.email!,
        nombreResponsable: `${responsable.nombre} ${responsable.apellidos}`,
      });
    }

    return alertas;
  }

  // ============================================================
  // AUTOMATIZACIÓN 2 — Informe de registros para familia
  // Paso 1: genera el borrador y lo guarda en BD
  // ============================================================

  async generarBorradorInforme(
    clienteId: string,
    desde: Date,
    hasta: Date,
    trabajadorId: string,
  ) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        registrosDiarios: {
          where: {
            compartirConFamilia: true,
            fechaRegistro: { gte: desde, lte: hasta },
          },
          include: {
            trabajador: { select: { nombre: true, apellidos: true } },
          },
          orderBy: { fechaRegistro: 'asc' },
        },
      },
    });

    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    if (cliente.registrosDiarios.length === 0) {
      throw new NotFoundException('No hay registros compartibles en el período indicado');
    }

    const desdeStr = this.toDateStr(desde);
    const hastaStr = this.toDateStr(hasta);

    const contenido = cliente.registrosDiarios
      .map((r) => {
        const fecha = this.toDateStr(r.fechaRegistro);
        const terapeuta = `${r.trabajador.nombre} ${r.trabajador.apellidos}`;
        return `[${fecha}] — ${terapeuta}\n${r.contenido}`;
      })
      .join('\n\n---\n\n');

    return this.prisma.informe.create({
      data: {
        titulo: `Informe de sesiones ${desdeStr} / ${hastaStr}`,
        tipoInforme: TipoInforme.REGISTROS,
        estado: EstadoInforme.BORRADOR,
        periodoDesde: desde,
        periodoHasta: hasta,
        contenido,
        clienteId,
        trabajadorId,
      },
    });
  }

  // ============================================================
  // AUTOMATIZACIÓN 2 — Informe de registros para familia
  // Paso 2: envía el informe (ya editado) a la familia
  // ============================================================

  async enviarInformeFamilia(informeId: string) {
    const informe = await this.prisma.informe.findUnique({
      where: { id: informeId },
      include: {
        cliente: {
          include: {
            contactosFamiliares: {
              where: { esContactoPrincipal: true, email: { not: null } },
            },
          },
        },
      },
    });

    if (!informe) throw new NotFoundException('Informe no encontrado');

    if (informe.tipoInforme !== TipoInforme.REGISTROS) {
      throw new BadRequestException('Solo se pueden enviar informes de tipo REGISTROS por esta vía');
    }

    if (informe.estado !== EstadoInforme.BORRADOR && informe.estado !== EstadoInforme.REVISION) {
      throw new BadRequestException('El informe ya fue enviado o está finalizado');
    }

    const contacto = informe.cliente.contactosFamiliares[0];
    if (!contacto) throw new NotFoundException('No hay contacto principal con email para este cliente');

    const webhookUrl = process.env.N8N_INFORME_WEBHOOK_URL;
    if (!webhookUrl) throw new InternalServerErrorException('N8N_INFORME_WEBHOOK_URL no configurada');

    try {
      await firstValueFrom(
        this.httpService.post(webhookUrl, {
          emailContacto: contacto.email!,
          nombreContacto: `${contacto.nombre} ${contacto.apellidos}`,
          clienteNombre: informe.cliente.nombre,
          clienteApellidos: informe.cliente.apellidos,
          desde: this.toDateStr(informe.periodoDesde),
          hasta: this.toDateStr(informe.periodoHasta),
          contenido: informe.contenido,
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException(`Error al contactar con n8n: ${error.message}`);
    }

    return this.prisma.informe.update({
      where: { id: informeId },
      data: {
        estado: EstadoInforme.ENVIADO,
        enviadoFamiliaAt: new Date(),
      },
    });
  }
}
