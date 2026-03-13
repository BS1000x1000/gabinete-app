import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  Logger,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { ROLES_GESTION } from '../roles/roles.constants';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Estadísticas generales del sistema — solo ADMIN y RECEP
   */
  @Get('estadisticas-generales')
  @Roles(...ROLES_GESTION)
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
   * ADMIN/RECEP reciben estadísticas globales; terapeutas solo las suyas
   */
  @Get('resumen')
  async getResumenCompleto(@Req() req: any) {
    const canVerTodo = (ROLES_GESTION as readonly string[]).includes(req.user.rol);
    const trabajadorId = canVerTodo ? undefined : req.user.userId;
    this.logger.log(`Obteniendo resumen completo del dashboard - scope: ${canVerTodo ? 'global' : req.user.userId}`);
    return this.dashboardService.getResumenCompleto(trabajadorId);
  }

  /**
   * Estadísticas avanzadas (página de análisis)
   * ADMIN/RECEP: pueden pasar cualquier trabajadorId o ninguno (global)
   * Terapeutas: siempre filtran por su propio userId
   */
  @Get('estadisticas-avanzadas')
  async getEstadisticasAvanzadas(
    @Req() req: any,
    @Query('desde') desdeStr: string,
    @Query('hasta') hastaStr: string,
    @Query('trabajadorId') trabajadorIdParam?: string,
  ) {
    if (!desdeStr || !hastaStr) {
      throw new BadRequestException('Los parámetros desde y hasta son obligatorios');
    }
    const desde = new Date(desdeStr);
    const hasta = new Date(hastaStr);
    if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
      throw new BadRequestException('Fechas inválidas');
    }
    const canVerTodo = (ROLES_GESTION as readonly string[]).includes(req.user.rol);
    const trabajadorId = canVerTodo ? trabajadorIdParam : req.user.userId;
    this.logger.log(`Obteniendo estadísticas avanzadas - scope: ${trabajadorId ?? 'global'}`);
    return this.dashboardService.getEstadisticasAvanzadas(desde, hasta, trabajadorId);
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