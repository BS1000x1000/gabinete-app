import { Controller, Get, Post, Param, Query, UseGuards, BadRequestException, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { N8nService } from './n8n.service';
import { GenerarPdfInformeDto } from './dto/generar-pdf-informe.dto';
import { N8nApiKeyGuard } from './guards/n8n-api-key.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { ROLES_CLINICOS } from '../roles/roles.constants';
import { Req } from '@nestjs/common';

@Controller('n8n')
export class N8nController {
  constructor(private readonly n8nService: N8nService) {}

  private parseDateRange(desdeStr: string, hastaStr: string): { desde: Date; hasta: Date } {
    if (!desdeStr || !hastaStr) {
      throw new BadRequestException('Los parámetros desde y hasta son obligatorios');
    }
    const desde = new Date(desdeStr);
    const hasta = new Date(hastaStr);
    hasta.setHours(23, 59, 59, 999);
    if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
      throw new BadRequestException('Formato de fecha inválido. Usar YYYY-MM-DD');
    }
    if (desde > hasta) {
      throw new BadRequestException('"desde" no puede ser posterior a "hasta"');
    }
    return { desde, hasta };
  }

  @Get('bonos-alertas')
  @UseGuards(N8nApiKeyGuard)
  getBonosAlertas() {
    return this.n8nService.getBonosAlertas();
  }

  // Usa @Res() directamente para evitar que ResponseInterceptor envuelva el binario en JSON
  @Post('pdf-informe')
  @UseGuards(N8nApiKeyGuard)
  async generarPdfInforme(
    @Body() body: GenerarPdfInformeDto,
    @Res() res: Response,
  ) {
    const buffer = await this.n8nService.generarPdfInforme(body);
    const filename = `informe_${body.clienteNombre}_${body.clienteApellidos}_${body.desde.slice(0, 7)}.pdf`
      .replace(/\s+/g, '_');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Post('generar-borrador/:clienteId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLES_CLINICOS)
  generarBorrador(
    @Param('clienteId') clienteId: string,
    @Query('desde') desdeStr: string,
    @Query('hasta') hastaStr: string,
    @Req() req: any,
  ) {
    const { desde, hasta } = this.parseDateRange(desdeStr, hastaStr);
    return this.n8nService.generarBorradorInforme(clienteId, desde, hasta, req.user.userId);
  }

  @Post('enviar-informe/:informeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLES_CLINICOS)
  enviarInforme(@Param('informeId') informeId: string) {
    return this.n8nService.enviarInformeFamilia(informeId);
  }

  @Post('generar-borrador-objetivos/:clienteId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLES_CLINICOS)
  generarBorradorObjetivos(
    @Param('clienteId') clienteId: string,
    @Query('desde') desdeStr: string,
    @Query('hasta') hastaStr: string,
    @Req() req: any,
  ) {
    const { desde, hasta } = this.parseDateRange(desdeStr, hastaStr);
    return this.n8nService.generarBorradorObjetivos(clienteId, desde, hasta, req.user.userId);
  }

  // Devuelve objetivos trabajados con sus notas en un período para análisis IA semestral
  @Get('objetivos-progreso/:clienteId')
  @UseGuards(N8nApiKeyGuard)
  getObjetivosProgreso(
    @Param('clienteId') clienteId: string,
    @Query('desde') desdeStr: string,
    @Query('hasta') hastaStr: string,
  ) {
    const { desde, hasta } = this.parseDateRange(desdeStr, hastaStr);
    return this.n8nService.getObjetivosProgreso(clienteId, desde, hasta);
  }
}
