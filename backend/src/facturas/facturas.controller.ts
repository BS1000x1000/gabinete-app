import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { ROLES_CLINICOS } from '../roles/roles.constants';
import { FacturasService } from './facturas.service';
import { MarcarPagadaDto } from './dto/marcar-pagada.dto';
import { CrearFacturaPuntualDto } from './dto/crear-factura-puntual.dto';
import { GenerarMesDto } from './dto/generar-mes.dto';
import { EstadoFactura } from '@prisma/client';

const ESTADOS_VALIDOS = new Set(Object.values(EstadoFactura));

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Get()
  findAll(
    @Req() req: any,
    @Query('anio') anio?: string,
    @Query('mes') mes?: string,
    @Query('clienteId') clienteId?: string,
    @Query('estado') estado?: string,
  ) {
    return this.facturasService.findAll(req.user, {
      anio: anio ? parseInt(anio, 10) : undefined,
      mes: mes ? parseInt(mes, 10) : undefined,
      clienteId,
      estado:
        estado && ESTADOS_VALIDOS.has(estado as EstadoFactura)
          ? (estado as EstadoFactura)
          : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.facturasService.findOne(id, req.user);
  }

  @Get(':id/pdf')
  async getPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const buffer = await this.facturasService.generarPdfBuffer(id, req.user);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="factura-${id}.pdf"`,
      'Content-Length': String(buffer.length),
    });
    res.end(buffer);
  }

  @Patch(':id/marcar-pagada')
  marcarPagada(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MarcarPagadaDto,
    @Req() req: any,
  ) {
    return this.facturasService.marcarPagada(id, dto, req.user);
  }

  @Patch(':id/anular')
  anular(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.facturasService.anular(id, req.user);
  }

  @Post(':id/regenerar-pdf')
  async regenerarPdf(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    await this.facturasService.regenerarPdf(id, req.user);
    return { ok: true };
  }

  @Post(':id/reenviar')
  reenviarEmail(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.facturasService.reenviarEmail(id, req.user);
  }

  @Post('generar-mes')
  @Roles('ADMIN')
  async generarMes(@Body() dto: GenerarMesDto) {
    const creadas = await this.facturasService.generarFacturasMes(
      dto.anio,
      dto.mes,
    );
    return { creadas };
  }

  @Post('puntual')
  @Roles(...ROLES_CLINICOS)
  crearPuntual(@Body() dto: CrearFacturaPuntualDto, @Req() req: any) {
    return this.facturasService.crearFacturaPuntual(dto, req.user);
  }
}
