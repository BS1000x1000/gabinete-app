import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
  Req,
  Res,
  ParseUUIDPipe,
  UseFilters,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterExceptionFilter } from '../common/filters/multer-exception.filter';
import { ContratosService, TAMANO_MAX_CONTRATO } from './contratos.service';
import type { FicheroContrato } from './contratos.service';
import { ContratosReplanificacionService } from './contratos-replanificacion.service';
import { ContratosCronService } from './contratos-cron.service';
import { ReplanificarContratoDto } from './dto/replanificar-contrato.dto';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { ROLES_CLINICOS } from '../roles/roles.constants';

@Controller('contratos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContratosController {
  private readonly logger = new Logger(ContratosController.name);

  constructor(
    private readonly contratosService: ContratosService,
    private readonly replanificacion: ContratosReplanificacionService,
    private readonly cron: ContratosCronService,
  ) {}

  /**
   * Fuerza la extension de la ventana de generacion. Existe para poder recuperar
   * a mano si el cron mensual no llego a ejecutarse (contenedor caido el dia 1).
   * Es idempotente: ejecutarlo de mas no duplica nada.
   */
  @Post('cron/ventana')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async forzarVentana() {
    this.logger.warn('POST /contratos/cron/ventana (manual)');
    return this.cron.extenderVentana('manual');
  }

  @Post()
  @Roles(...ROLES_CLINICOS)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateContratoDto, @Req() req: any) {
    this.logger.log(`POST /contratos - cliente ${dto.clienteId}`);
    return this.contratosService.create(dto, req.user);
  }

  @Get()
  @Roles(...ROLES_CLINICOS)
  findAll(@Req() req: any, @Query('soloMias') soloMias?: string) {
    this.logger.log(`GET /contratos - user ${req.user.userId}`);
    return this.contratosService.findAll(req.user, {
      soloMias: soloMias === 'true',
    });
  }

  @Get('cliente/:clienteId')
  @Roles(...ROLES_CLINICOS)
  findByCliente(@Param('clienteId') clienteId: string, @Req() req: any) {
    this.logger.log(`GET /contratos/cliente/${clienteId}`);
    return this.contratosService.findByCliente(clienteId, req.user);
  }

  /**
   * Que clientes tiene el terapeuta cada dia de la semana y a que hora, segun
   * los contratos vigentes. Alimenta la rejilla de "Mi semana".
   *
   * Va ANTES de `@Get(':id')` a proposito: si no, 'carga-semanal' entraria por
   * la ruta parametrica y se buscaria un contrato con ese id.
   */
  @Get('carga-semanal')
  @Roles(...ROLES_CLINICOS)
  cargaSemanal(@Req() req: any, @Query('trabajadorId') trabajadorId?: string) {
    const objetivo = trabajadorId ?? req.user.userId;
    this.logger.log(`GET /contratos/carga-semanal - trabajador ${objetivo}`);
    return this.contratosService.cargaSemanal(objetivo, req.user);
  }

  @Get(':id')
  @Roles(...ROLES_CLINICOS)
  findOne(@Param('id') id: string, @Req() req: any) {
    this.logger.log(`GET /contratos/${id}`);
    return this.contratosService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(...ROLES_CLINICOS)
  update(@Param('id') id: string, @Body() dto: UpdateContratoDto, @Req() req: any) {
    this.logger.log(`PATCH /contratos/${id}`);
    return this.contratosService.update(id, dto, req.user);
  }

  @Patch(':id/finalizar')
  @Roles(...ROLES_CLINICOS)
  finalizar(@Param('id') id: string, @Req() req: any) {
    this.logger.log(`PATCH /contratos/${id}/finalizar`);
    return this.contratosService.finalizar(id, req.user);
  }

  /**
   * Vista previa de una replanificación: qué sesiones se mueven, cuáles se crean
   * o se cancelan, cuáles caen en festivo o vacaciones y con qué chocan.
   * No escribe nada.
   */
  @Post(':id/replanificar/preview')
  @Roles(...ROLES_CLINICOS)
  @HttpCode(HttpStatus.OK)
  async previewReplanificar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplanificarContratoDto,
    @Req() req: any,
  ) {
    this.logger.log(`POST /contratos/${id}/replanificar/preview`);
    return this.replanificacion.preview(id, dto, req.user);
  }

  /**
   * Aplica la replanificación. Exige la firma de la vista previa: si la agenda
   * cambió por debajo, se rechaza en vez de aplicar un plan que nadie aprobó.
   */
  @Post(':id/replanificar')
  @Roles(...ROLES_CLINICOS)
  @HttpCode(HttpStatus.OK)
  async replanificar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplanificarContratoDto,
    @Req() req: any,
  ) {
    this.logger.warn(`POST /contratos/${id}/replanificar`);
    return this.replanificacion.aplicar(id, dto, req.user);
  }

  /**
   * Sube el contrato firmado. A partir de aqui sustituye al PDF generado.
   * Mismo patron que `documentos`: limite en multer + filtro que traduce el
   * MulterError a 400 (si no, el filtro global lo convertiria en un 500 opaco).
   */
  @Post(':id/documento')
  @Roles(...ROLES_CLINICOS)
  @UseFilters(new MulterExceptionFilter(TAMANO_MAX_CONTRATO))
  @UseInterceptors(
    FileInterceptor('fichero', { limits: { fileSize: TAMANO_MAX_CONTRATO } }),
  )
  async subirDocumento(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() fichero: FicheroContrato,
    @Req() req: any,
  ) {
    this.logger.log(`POST /contratos/${id}/documento`);
    return this.contratosService.subirDocumentoFirmado(id, fichero, req.user);
  }

  /**
   * Devuelve el contrato en PDF. Si hay uno firmado subido, redirige a su URL
   * prefirmada (el binario va directo desde Object Storage al navegador); si no,
   * se genera al vuelo con Puppeteer como se ha hecho siempre.
   */
  @Get(':id/pdf')
  @Roles(...ROLES_CLINICOS)
  async getPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    this.logger.log(`GET /contratos/${id}/pdf`);

    const urlFirmado = await this.contratosService.getUrlDocumentoFirmado(id, req.user);
    if (urlFirmado) {
      return res.redirect(urlFirmado);
    }

    const buffer = await this.contratosService.generarPdf(id, req.user);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="contrato-${id}.pdf"`,
      'Content-Length': String(buffer.length),
    });
    res.end(buffer);
  }
}
