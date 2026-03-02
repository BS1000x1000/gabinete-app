import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  Logger,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Estadísticas generales del sistema
   */
  @Get('estadisticas-generales')
  async getEstadisticasGenerales() {
    this.logger.log('Obteniendo estadísticas generales del sistema');
    return this.dashboardService.getEstadisticasGenerales();
  }

  /**
   * Estadísticas del trabajador autenticado
   */
  @Get('mis-estadisticas')
  async getMisEstadisticas(@Req() req: any) {
    const trabajadorId = req.user.userId;
    this.logger.log(`Obteniendo estadísticas del trabajador: ${trabajadorId}`);
    return this.dashboardService.getEstadisticasTrabajador(trabajadorId);
  }

  /**
   * Clientes más activos
   */
  @Get('clientes-mas-activos')
  async getClientesMasActivos(
    @Query('limite', new DefaultValuePipe(10), ParseIntPipe) limite: number,
  ) {
    this.logger.log(`Obteniendo top ${limite} clientes más activos`);
    return this.dashboardService.getClientesMasActivos(limite);
  }

  /**
   * Objetivos más trabajados
   */
  @Get('objetivos-mas-trabajados')
  async getObjetivosMasTrabajados(
    @Query('limite', new DefaultValuePipe(10), ParseIntPipe) limite: number,
  ) {
    this.logger.log(`Obteniendo top ${limite} objetivos más trabajados`);
    return this.dashboardService.getObjetivosMasTrabajados(limite);
  }

  /**
   * Actividad reciente
   */
  @Get('actividad-reciente')
  async getActividadReciente(
    @Query('limite', new DefaultValuePipe(10), ParseIntPipe) limite: number,
  ) {
    this.logger.log(`Obteniendo últimas ${limite} actividades`);
    return this.dashboardService.getActividadReciente(limite);
  }

  /**
   * Distribución de sesiones por tipo
   */
  @Get('distribucion-sesiones')
  async getDistribucionSesionesPorTipo() {
    this.logger.log('Obteniendo distribución de sesiones por tipo');
    return this.dashboardService.getDistribucionSesionesPorTipo();
  }

  /**
   * Resumen completo del dashboard
   */
  @Get('resumen')
  async getResumenCompleto(@Req() req: any) {
    const trabajadorId = req.user.userId;
    this.logger.log(`Obteniendo resumen completo del dashboard para: ${trabajadorId}`);
    return this.dashboardService.getResumenCompleto(trabajadorId);
  }

  /**
   * Vista operativa del día — pantalla de inicio del terapeuta
   */
  @Get('mi-dia')
  async getMiDia(@Req() req: any) {
    const { userId, nombre } = req.user;
    this.logger.log(`Obteniendo vista del día para: ${userId}`);
    return this.dashboardService.getMiDia(userId, nombre);
  }
}