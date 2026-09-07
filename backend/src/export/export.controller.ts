import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { ROLES_GESTION } from '../roles/roles.constants';
import { AccesoClienteService } from '../common/acceso/acceso-cliente.service';
import { ExportService, ExportResult } from './export.service';
import { ExportQueryDto } from './dto/export-query.dto';

@Controller('export')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExportController {
  private readonly logger = new Logger(ExportController.name);

  constructor(
    private readonly exportService: ExportService,
    private readonly acceso: AccesoClienteService,
  ) {}

  // El clienteId llega por la URL: sin comprobarlo contra quien pide, estos tres
  // endpoints exportaban el historial de cualquier menor a cualquier autenticado.

  @Get('sesiones/:clienteId')
  async exportSesiones(
    @Param('clienteId') clienteId: string,
    @Query() query: ExportQueryDto,
    @Res() res: Response,
    @Req() req: any,
  ) {
    this.logger.log(`GET /export/sesiones/${clienteId} formato=${query.formato}`);
    await this.acceso.assertAcceso(clienteId, req.user);
    this.sendFile(res, await this.exportService.exportSesiones(clienteId, query));
  }

  @Get('bonos/:clienteId')
  async exportBonosCliente(
    @Param('clienteId') clienteId: string,
    @Query() query: ExportQueryDto,
    @Res() res: Response,
    @Req() req: any,
  ) {
    this.logger.log(`GET /export/bonos/${clienteId} formato=${query.formato}`);
    await this.acceso.assertAcceso(clienteId, req.user);
    this.sendFile(res, await this.exportService.exportBonos(clienteId, query));
  }

  /** Sin clienteId no hay nada que acotar, asi que es vision global: gestion. */
  @Get('bonos')
  @Roles(...ROLES_GESTION)
  async exportBonosTodos(
    @Query() query: ExportQueryDto,
    @Res() res: Response,
  ) {
    this.logger.log(`GET /export/bonos (todos) formato=${query.formato}`);
    this.sendFile(res, await this.exportService.exportBonos(null, query));
  }

  private sendFile(res: Response, result: ExportResult): void {
    res.set({
      'Content-Type': result.contentType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Content-Length': String(result.buffer.length),
    });
    res.end(result.buffer);
  }
}
