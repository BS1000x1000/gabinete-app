import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import { PackFacturasDto } from './dto/pack-facturas.dto';
import { FacturasPackService } from './facturas-pack.service';
import { FacturasGestoriaService } from './facturas-gestoria.service';
import { EstadoFactura } from '@prisma/client';

const ESTADOS_VALIDOS = new Set(Object.values(EstadoFactura));

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('facturas')
export class FacturasController {
  constructor(
    private readonly facturasService: FacturasService,
    private readonly packService: FacturasPackService,
    private readonly gestoriaService: FacturasGestoriaService,
  ) {}

  @Get()
  @Roles(...ROLES_CLINICOS)
  findAll(
    @Req() req: any,
    @Query('anio') anio?: string,
    @Query('mes') mes?: string,
    @Query('clienteId') clienteId?: string,
    @Query('estado') estado?: string,
    @Query('soloMias') soloMias?: string,
  ) {
    return this.facturasService.findAll(req.user, {
      anio: anio ? parseInt(anio, 10) : undefined,
      mes: mes ? parseInt(mes, 10) : undefined,
      clienteId,
      soloMias: soloMias === 'true',
      estado:
        estado && ESTADOS_VALIDOS.has(estado as EstadoFactura)
          ? (estado as EstadoFactura)
          : undefined,
    });
  }

  /**
   * Que se generaria en ese periodo, sin escribir nada. El boton de generar era
   * ciego: no habia forma de saber cuantas facturas ni por cuanto importe hasta
   * despues de haberlas emitido.
   */
  @Post('generar-mes/preview')
  @Roles(...ROLES_CLINICOS)
  @HttpCode(HttpStatus.OK)
  previsualizarGeneracion(@Body() dto: GenerarMesDto, @Req() req: any) {
    return this.facturasService.previsualizarGeneracionMes(dto.anio, dto.mes, {
      trabajadorId: this.alcance(dto, req.user),
    });
  }

  /**
   * Genera las facturas de un periodo. Cada terapeuta puede recuperar las suyas
   * de cualquier mes ya cerrado; el ADMIN ademas puede lanzarlo para todo el
   * gabinete, que es la palanca manual del cron del dia 1.
   */
  @Post('generar-mes')
  @Roles(...ROLES_CLINICOS)
  generarMes(@Body() dto: GenerarMesDto, @Req() req: any) {
    return this.facturasService.generarFacturasMes(dto.anio, dto.mes, {
      trabajadorId: this.alcance(dto, req.user),
      user: req.user,
    });
  }

  /** Un no-ADMIN solo genera lo suyo, pida lo que pida. */
  private alcance(
    dto: GenerarMesDto,
    user: { userId: string; rol: string },
  ): string | undefined {
    if (user.rol !== 'ADMIN') return user.userId;
    return dto.soloMias ? user.userId : undefined;
  }

  /**
   * Que llevaria el paquete: cuantas facturas, por cuanto y con que nombres de
   * fichero. Es lo que se enseña antes de descargar o de mandarlo a la gestoria,
   * para que nadie mande a ciegas.
   */
  @Get('pack/resumen')
  @Roles(...ROLES_CLINICOS)
  async resumenPack(@Query() dto: PackFacturasDto, @Req() req: any) {
    const facturas = await this.packService.facturasDeLaSeleccion(
      req.user,
      dto,
    );
    return this.packService.resumen(facturas);
  }

  /**
   * El paquete para la gestoria: un zip con el libro de facturas emitidas en
   * Excel y los PDF, o solo el libro si se pide `formato=excel`.
   *
   * `@Res()` es obligatorio: sin el, el interceptor global envolveria el binario
   * en `{ success, data }` y lo dejaria inservible.
   */
  @Get('pack')
  @Roles(...ROLES_CLINICOS)
  async descargarPack(
    @Query() dto: PackFacturasDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const facturas = await this.packService.facturasDeLaSeleccion(
      req.user,
      dto,
    );
    const archivo =
      dto.formato === 'excel'
        ? await this.packService.construirLibro(facturas)
        : await this.packService.construirPack(facturas);

    res.set({
      'Content-Type': archivo.contentType,
      'Content-Disposition': `attachment; filename="${archivo.filename}"`,
      'Content-Length': String(archivo.buffer.length),
      // Cabecera propia: el navegador no puede leer el cuerpo del zip para
      // saber si falto algun PDF, y el usuario tiene que enterarse.
      'X-Pack-Incidencias': String(archivo.incidencias.length),
    });
    res.end(archivo.buffer);
  }

  // ── Entrega a la gestoría ────────────────────────────────────────────────

  /** Periodos ya cerrados cuyas facturas no han salido nunca hacia la gestoría. */
  @Get('gestoria/pendientes')
  @Roles(...ROLES_CLINICOS)
  pendientesGestoria(@Req() req: any) {
    return this.gestoriaService.pendientesDeEntregar(req.user.userId);
  }

  @Get('gestoria/historial')
  @Roles(...ROLES_CLINICOS)
  historialGestoria(
    @Req() req: any,
    @Query('trabajadorId') trabajadorId?: string,
  ) {
    return this.gestoriaService.historial(req.user, trabajadorId);
  }

  /**
   * Que se mandaria y a quien, antes de mandarlo. Salen datos personales hacia
   * un tercero: esto no se hace a ciegas.
   */
  @Get('gestoria/preview')
  @Roles(...ROLES_CLINICOS)
  previewGestoria(@Query() dto: PackFacturasDto, @Req() req: any) {
    return this.gestoriaService.previsualizar(req.user, dto);
  }

  @Post('gestoria/enviar')
  @Roles(...ROLES_CLINICOS)
  @HttpCode(HttpStatus.OK)
  enviarGestoria(@Body() dto: PackFacturasDto, @Req() req: any) {
    return this.gestoriaService.enviar(req.user, dto);
  }

  @Post('puntual')
  @Roles(...ROLES_CLINICOS)
  crearPuntual(@Body() dto: CrearFacturaPuntualDto, @Req() req: any) {
    return this.facturasService.crearFacturaPuntual(dto, req.user);
  }

  // ── Rutas con :id ────────────────────────────────────────────────────────
  //
  // Van las ultimas a proposito. Express resuelve por orden de declaracion, asi
  // que con `@Get(':id')` declarado antes, `GET /facturas/pack` entraba por ahi
  // con `id = "pack"` y el `ParseUUIDPipe` lo rechazaba con un 400: la descarga
  // del paquete no llegaba nunca a su controlador. Cualquier ruta literal nueva
  // tiene que quedar por encima de este bloque.

  @Get(':id')
  @Roles(...ROLES_CLINICOS)
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.facturasService.findOne(id, req.user);
  }

  @Get(':id/pdf')
  @Roles(...ROLES_CLINICOS)
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
  @Roles(...ROLES_CLINICOS)
  marcarPagada(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MarcarPagadaDto,
    @Req() req: any,
  ) {
    return this.facturasService.marcarPagada(id, dto, req.user);
  }

  @Patch(':id/anular')
  @Roles(...ROLES_CLINICOS)
  anular(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.facturasService.anular(id, req.user);
  }

  @Post(':id/regenerar-pdf')
  @Roles(...ROLES_CLINICOS)
  async regenerarPdf(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    await this.facturasService.regenerarPdf(id, req.user);
    return { ok: true };
  }

  @Post(':id/reenviar')
  @Roles(...ROLES_CLINICOS)
  reenviarEmail(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.facturasService.reenviarEmail(id, req.user);
  }
}
