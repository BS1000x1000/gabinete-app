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

  // Llamado por el cron de n8n — protegido por API key
  @Get('bonos-alertas')
  @UseGuards(N8nApiKeyGuard)
  getBonosAlertas() {
    return this.n8nService.getBonosAlertas();
  }

  // Genera PDF del informe redactado por IA — llamado por n8n
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

  // Genera un borrador de informe a partir de los registros del período
  @Post('generar-borrador/:clienteId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLES_CLINICOS)
  generarBorrador(
    @Param('clienteId') clienteId: string,
    @Query('desde') desdeStr: string,
    @Query('hasta') hastaStr: string,
    @Req() req: any,
  ) {
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
      throw new BadRequestException('La fecha "desde" no puede ser posterior a "hasta"');
    }

    return this.n8nService.generarBorradorInforme(clienteId, desde, hasta, req.user.userId);
  }

  // Envía el informe ya revisado/editado a la familia
  @Post('enviar-informe/:informeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLES_CLINICOS)
  enviarInforme(@Param('informeId') informeId: string) {
    return this.n8nService.enviarInformeFamilia(informeId);
  }
}
