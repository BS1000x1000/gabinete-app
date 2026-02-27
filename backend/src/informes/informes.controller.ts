import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import type { Response } from 'express'; // ← Import correcto
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateInformeDto, UpdateInformeDto } from './dto/informe.dto';
import { InformesService } from './informes.service';
import { InformesPdfService } from './informes-pdf.service';

@Controller('informes')
@UseGuards(JwtAuthGuard)
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
  async findAll() {
    this.logger.log('GET /informes');
    return this.informesService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateInformeDto, @Req() req: any) {
    const trabajadorId = req.user.userId;
    this.logger.log(`POST /informes - Tipo: ${createDto.tipoInforme} - Cliente: ${createDto.clienteId}`);
    return this.informesService.create(createDto, trabajadorId);
  }

  @Get('cliente/:clienteId')
  async findByCliente(@Param('clienteId') clienteId: string) {
    this.logger.log(`GET /informes/cliente/${clienteId}`);
    return this.informesService.findByCliente(clienteId);
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
  @UseGuards()
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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`GET /informes/${id}`);
    return this.informesService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateInformeDto) {
    this.logger.log(`PATCH /informes/${id}`);
    return this.informesService.update(id, updateDto);
  }

  @Patch(':id/finalizar')
  async finalizar(@Param('id') id: string) {
    this.logger.log(`PATCH /informes/${id}/finalizar`);
    return this.informesService.finalizar(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    this.logger.warn(`DELETE /informes/${id}`);
    return this.informesService.remove(id);
  }
}