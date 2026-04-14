import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import type { Response } from 'express'; // ← Import correcto
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { ROLES_CLINICOS } from '../roles/roles.constants';
import { CreateInformeDto, UpdateInformeDto } from './dto/informe.dto';
import { InformesService } from './informes.service';
import { InformesPdfService } from './informes-pdf.service';

@Controller('informes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InformesController {
  private readonly logger = new Logger(InformesController.name);

  constructor(
    private readonly informesService: InformesService,
    private readonly informePdfService: InformesPdfService,
  ) {}

  // ==========================================
  // RUTAS ESPECÍFICAS PRIMERO (sin :id)
  // ==========================================

  @Get()
  async findAll(@Query() pagination: PaginationDto) {
    this.logger.log('GET /informes');
    return this.informesService.findAll(pagination);
  }

  @Post()
  @Roles(...ROLES_CLINICOS)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateInformeDto, @Req() req: any) {
    const trabajadorId = req.user.userId;
    this.logger.log(`POST /informes - Tipo: ${createDto.tipoInforme} - Cliente: ${createDto.clienteId}`);
    return this.informesService.create(createDto, trabajadorId);
  }

  @Get('cliente/:clienteId')
  async findByCliente(@Param('clienteId') clienteId: string, @Req() req: any) {
    this.logger.log(`GET /informes/cliente/${clienteId}`);
    return this.informesService.findByCliente(clienteId, req.user);
  }

  @Get('mis-informes')
  async findMisInformes(@Req() req: any) {
    const trabajadorId = req.user.userId;
    this.logger.log(`GET /informes/mis-informes - Trabajador: ${trabajadorId}`);
    return this.informesService.findByTrabajador(trabajadorId);
  }

  // ==========================================
  // RUTAS CON :id  (más específicas primero)
  // ==========================================

  /**
   * GET /api/informes/:id/pdf
   * Genera y devuelve el PDF del informe como descarga directa
   */
  @Get(':id/pdf')
  async descargarPdf(
    @Param('id') id: string,
    @Res() res: Response,           // ← Ahora tipado correctamente con Express Response
  ) {
    this.logger.log(`📄 GET /api/informes/${id}/pdf`);

    const buffer = await this.informePdfService.generarPdf(id);

    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="informe_${id}.pdf"`,
      'Content-Length':      String(buffer.length),
    });

    res.end(buffer);
  }

  /**
   * GET /api/informes/:id/pdf-url
   * Devuelve una URL prefirmada (15 min) para el PDF archivado en R2.
   */
  @Get(':id/pdf-url')
  async getPdfUrl(@Param('id') id: string, @Req() req: any) {
    this.logger.log(`GET /api/informes/${id}/pdf-url`);
    return this.informesService.getPdfUrl(id, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    this.logger.log(`GET /informes/${id}`);
    return this.informesService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(...ROLES_CLINICOS)
  async update(@Param('id') id: string, @Body() updateDto: UpdateInformeDto) {
    this.logger.log(`PATCH /informes/${id}`);
    return this.informesService.update(id, updateDto);
  }

  @Patch(':id/finalizar')
  @Roles(...ROLES_CLINICOS)
  async finalizar(@Param('id') id: string) {
    this.logger.log(`PATCH /informes/${id}/finalizar`);
    return this.informesService.finalizar(id);
  }

  @Delete(':id')
  @Roles(...ROLES_CLINICOS)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    this.logger.warn(`DELETE /informes/${id}`);
    return this.informesService.remove(id);
  }
}