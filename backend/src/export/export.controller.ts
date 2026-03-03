import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExportService } from './export.service';
import { ExportQueryDto } from './dto/export-query.dto';

@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  private readonly logger = new Logger(ExportController.name);

  constructor(private readonly exportService: ExportService) {}

  @Get('sesiones/:clienteId')
  async exportSesiones(
    @Param('clienteId') clienteId: string,
    @Query() query: ExportQueryDto,
    @Res() res: Response,
  ) {
    this.logger.log(`GET /export/sesiones/${clienteId} formato=${query.formato}`);
    const result = await this.exportService.exportSesiones(clienteId, query);
    res.set({
      'Content-Type': result.contentType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Content-Length': String(result.buffer.length),
    });
    res.end(result.buffer);
  }

  @Get('bonos/:clienteId')
  async exportBonosCliente(
    @Param('clienteId') clienteId: string,
    @Query() query: ExportQueryDto,
    @Res() res: Response,
  ) {
    this.logger.log(`GET /export/bonos/${clienteId} formato=${query.formato}`);
    const result = await this.exportService.exportBonos(clienteId, query);
    res.set({
      'Content-Type': result.contentType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Content-Length': String(result.buffer.length),
    });
    res.end(result.buffer);
  }

  @Get('bonos')
  async exportBonosTodos(
    @Query() query: ExportQueryDto,
    @Res() res: Response,
  ) {
    this.logger.log(`GET /export/bonos (todos) formato=${query.formato}`);
    const result = await this.exportService.exportBonos(null, query);
    res.set({
      'Content-Type': result.contentType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Content-Length': String(result.buffer.length),
    });
    res.end(result.buffer);
  }
}
