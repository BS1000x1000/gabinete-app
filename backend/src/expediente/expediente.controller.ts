import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UseFilters,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Logger,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CategoriaDocumento } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { ROLES_CLINICOS } from '../roles/roles.constants';
import { ExpedienteService } from './expediente.service';
import { MulterExceptionFilter } from '../common/filters/multer-exception.filter';
import type { FicheroSubido } from '../documentos/dto/documento.dto';
import { TAMANO_MAX_BYTES } from '../documentos/documentos.service';

/**
 * Expediente inicial: los tres documentos que la familia firma al empezar.
 *
 * El PDF en si no se sirve desde aqui — se descarga por `documentos/:id/descarga`
 * como cualquier otro. Este controlador solo gobierna su ciclo de vida.
 */
@Controller('expediente')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpedienteController {
  private readonly logger = new Logger(ExpedienteController.name);

  constructor(private readonly expediente: ExpedienteService) {}

  /** Estado de los tres documentos de un cliente, existan o no. */
  @Get('cliente/:clienteId')
  estado(@Param('clienteId', ParseUUIDPipe) clienteId: string, @Req() req: any) {
    return this.expediente.estado(clienteId, req.user);
  }

  /** Genera (o regenera) los tres documentos a partir de un contrato. */
  @Post('contrato/:contratoId/generar')
  @Roles(...ROLES_CLINICOS, 'RECEP')
  @HttpCode(HttpStatus.OK)
  generar(@Param('contratoId', ParseUUIDPipe) contratoId: string, @Req() req: any) {
    this.logger.log(`POST /expediente/contrato/${contratoId}/generar`);
    return this.expediente.generar(contratoId, req.user);
  }

  /**
   * Descarga el documento generado al vuelo, sin guardarlo.
   *
   * Permite ver como va a quedar antes de generarlo de verdad, y es la unica
   * via en local, donde no hay Object Storage y por tanto no se puede persistir
   * nada (a disco del contenedor no se escribe nunca: es efimero).
   */
  @Get('contrato/:contratoId/vista-previa/:categoria')
  async vistaPrevia(
    @Param('contratoId', ParseUUIDPipe) contratoId: string,
    @Param('categoria') categoria: CategoriaDocumento,
    @Req() req: any,
    @Res() res: Response,
  ) {
    this.logger.log(`GET /expediente/contrato/${contratoId}/vista-previa/${categoria}`);

    const { buffer, nombreFichero } = await this.expediente.vistaPrevia(
      contratoId,
      categoria,
      req.user,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${nombreFichero}"`,
      'Content-Length': String(buffer.length),
    });
    res.end(buffer);
  }

  /** Deja constancia de que el documento ya salio hacia la familia. */
  @Post('documento/:documentoId/enviado')
  @Roles(...ROLES_CLINICOS, 'RECEP')
  @HttpCode(HttpStatus.OK)
  marcarEnviado(
    @Param('documentoId', ParseUUIDPipe) documentoId: string,
    @Req() req: any,
  ) {
    return this.expediente.marcarEnviado(documentoId, req.user);
  }

  /** Sube la version firmada que devuelve la familia. */
  @Post('documento/:documentoId/firmado')
  @Roles(...ROLES_CLINICOS, 'RECEP')
  @UseInterceptors(FileInterceptor('fichero', { limits: { fileSize: TAMANO_MAX_BYTES } }))
  @UseFilters(new MulterExceptionFilter(TAMANO_MAX_BYTES))
  @HttpCode(HttpStatus.CREATED)
  registrarFirmado(
    @Param('documentoId', ParseUUIDPipe) documentoId: string,
    @UploadedFile() fichero: FicheroSubido,
    @Req() req: any,
  ) {
    this.logger.log(`POST /expediente/documento/${documentoId}/firmado`);
    return this.expediente.registrarFirmado(documentoId, fichero, req.user);
  }
}
