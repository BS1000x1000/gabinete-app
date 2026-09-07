import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  UseGuards,
  UseInterceptors,
  UseFilters,
  UploadedFile,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoriaDocumento } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { ROLES_CLINICOS } from '../roles/roles.constants';
import { DocumentosService, TAMANO_MAX_BYTES } from './documentos.service';
import { CreateDocumentoDto, UpdateDocumentoDto } from './dto/documento.dto';
// Interfaz pura: en una firma decorada debe ir como `import type` (isolatedModules + emitDecoratorMetadata)
import type { FicheroSubido } from './dto/documento.dto';
import { MulterExceptionFilter } from '../common/filters/multer-exception.filter';
import { AuditService } from '../auth/audit.service';

/**
 * Documentación externa del expediente del cliente (informes médicos, escolares,
 * administrativos). Los informes generados por la app viven en `informes`.
 *
 * Subir y editar: roles clínicos + RECEP (RECEP gestiona la documentación
 * administrativa). Eliminar: ADMIN o quien lo subió (comprobado en el servicio).
 */
@Controller('documentos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentosController {
  private readonly logger = new Logger(DocumentosController.name);

  constructor(
    private readonly documentosService: DocumentosService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Deja constancia de quien toca un documento del expediente.
   *
   * La lectura de la ficha (`GET /clientes/:id`) si se auditaba, pero el
   * documento —donde esta el informe medico escaneado— no: ni al subirlo, ni al
   * pedir el enlace de descarga, ni al borrarlo. `AuditService` nunca bloquea la
   * operacion principal (se traga sus propios errores).
   */
  private rastro(accion: string, documentoId: string, req: any) {
    this.audit.registrar({
      evento: 'ACCESO_DOCUMENTO',
      userId: req.user?.userId,
      username: req.user?.username,
      ip: req.ip,
      recurso: documentoId,
      metadata: { accion },
    });
  }

  @Post()
  @Roles(...ROLES_CLINICOS, 'RECEP')
  @HttpCode(HttpStatus.CREATED)
  @UseFilters(new MulterExceptionFilter(TAMANO_MAX_BYTES))
  @UseInterceptors(
    FileInterceptor('fichero', { limits: { fileSize: TAMANO_MAX_BYTES } }),
  )
  async create(
    @UploadedFile() fichero: FicheroSubido,
    @Body() dto: CreateDocumentoDto,
    @Req() req: any,
  ) {
    this.logger.log(
      `POST /documentos - Cliente: ${dto.clienteId} - Categoría: ${dto.categoria}`,
    );
    const creado = await this.documentosService.create(dto, fichero, req.user);
    this.rastro('SUBIDA', creado.id, req);
    return creado;
  }

  @Get('cliente/:clienteId')
  async findByCliente(
    @Param('clienteId') clienteId: string,
    @Query('categoria') categoria: CategoriaDocumento | undefined,
    @Req() req: any,
  ) {
    this.logger.log(`GET /documentos/cliente/${clienteId}`);
    return this.documentosService.findByCliente(clienteId, req.user, { categoria });
  }

  @Get(':id/descarga')
  async getUrlDescarga(@Param('id') id: string, @Req() req: any) {
    this.logger.log(`GET /documentos/${id}/descarga`);
    const url = await this.documentosService.getUrlDescarga(id, req.user);
    // El enlace prefirmado deja el fichero accesible sin volver a pasar por la
    // API: el momento auditable es este, no la descarga en si.
    this.rastro('ENLACE_DESCARGA', id, req);
    return url;
  }

  /**
   * Sirve el binario desde la API. Solo responde en el modo de almacenamiento
   * local de desarrollo; con el bucket configurado la descarga va por URL
   * prefirmada y no pasa por el contenedor.
   *
   * `@Res()` evita el ResponseInterceptor, que envolvería el PDF en JSON.
   */
  @Get(':id/fichero')
  async getFichero(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const { buffer, nombre, mimeType } = await this.documentosService.getFichero(
      id,
      req.user,
    );
    // El nombre lo escribe una persona: fuera todo lo que no sobreviva a una cabecera.
    const seguro = nombre.replace(/[^\w.\- ]+/g, '_');
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${seguro}"`,
      'Content-Length': String(buffer.length),
    });
    res.end(buffer);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.documentosService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(...ROLES_CLINICOS, 'RECEP')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentoDto,
    @Req() req: any,
  ) {
    this.logger.log(`PATCH /documentos/${id}`);
    return this.documentosService.update(id, dto, req.user);
  }

  @Delete(':id')
  @Roles(...ROLES_CLINICOS, 'RECEP')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Req() req: any) {
    this.logger.warn(`DELETE /documentos/${id}`);
    const resultado = await this.documentosService.remove(id, req.user);
    this.rastro('BORRADO', id, req);
    return resultado;
  }
}
