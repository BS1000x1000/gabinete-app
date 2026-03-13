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
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SesionesService } from './sesiones.service';
import { GenerarSesionesDto } from './dto/generar-sesiones.dto';
import { CompletarSesionDto } from './dto/completar-sesion.dto';
import { CancelarSesionDto } from './dto/cancelar-sesion.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { ROLES_CLINICOS } from 'src/roles/roles.constants';

@Controller('sesiones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SesionesController {
  private readonly logger = new Logger(SesionesController.name);

  constructor(private readonly sesionesService: SesionesService) {}

  // ==========================================
  // 🔥 RUTAS ESPECÍFICAS PRIMERO (SIN :id)
  // ==========================================

  @Post('generar')
  @Roles(...ROLES_CLINICOS)
  @HttpCode(HttpStatus.CREATED)
  async generarSesiones(@Body() generarSesionesDto: GenerarSesionesDto) {
    this.logger.log('POST /sesiones/generar');
    return this.sesionesService.generarSesiones(generarSesionesDto);
  }

  @Get('hoy')
  async getSesionesHoy(@Req() req: any) {
    const trabajadorId = req.user.userId;
    this.logger.log(`GET /sesiones/hoy - Trabajador: ${trabajadorId}`);
    return this.sesionesService.getSesionesHoy(trabajadorId);
  }

  @Get('mi-calendario/diario')
  async getMiCalendarioDiario(
    @Req() req: any,
    @Query('fecha') fecha?: string,
    @Query('trabajadorId') trabajadorIdParam?: string,
  ) {
    const canVerTodo = ['ADMIN', 'RECEP'].includes(req.user.rol);
    const trabajadorId = (canVerTodo && trabajadorIdParam) ? trabajadorIdParam : req.user.userId;
    const fechaReferencia = fecha ? new Date(fecha) : undefined;

    this.logger.log(`GET /sesiones/mi-calendario/diario - Trabajador: ${trabajadorId}, Fecha: ${fecha || 'hoy'}`);

    return this.sesionesService.getCalendarioDiario(
      trabajadorId,
      fechaReferencia,
    );
  }

  @Get('mi-calendario/semanal')
  async getMiCalendarioSemanal(
    @Req() req: any,
    @Query('fecha') fecha?: string,
    @Query('trabajadorId') trabajadorIdParam?: string,
  ) {
    const canVerTodo = ['ADMIN', 'RECEP'].includes(req.user.rol);
    const trabajadorId = (canVerTodo && trabajadorIdParam) ? trabajadorIdParam : req.user.userId;
    const fechaReferencia = fecha ? new Date(fecha) : undefined;

    this.logger.log(`GET /sesiones/mi-calendario/semanal - Trabajador: ${trabajadorId}`);

    return this.sesionesService.getCalendarioSemanal(
      trabajadorId,
      fechaReferencia,
    );
  }

  @Get('mi-calendario/mensual')
  async getMiCalendarioMensual(
    @Req() req: any,
    @Query('fecha') fecha?: string,
  ) {
    const trabajadorId = req.user.userId;
    const fechaReferencia = fecha ? new Date(fecha) : undefined;

    this.logger.log(`GET /sesiones/mi-calendario/mensual`);

    return this.sesionesService.getCalendarioMensual(
      trabajadorId,
      fechaReferencia,
    );
  }

  @Get('trabajador/horario')
  async findByTrabajador(
    @Req() req: any,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    const trabajadorId = req.user.userId;
    this.logger.log(`GET /sesiones/trabajador/${trabajadorId}`);
    return this.sesionesService.findByTrabajadorYFecha(
      trabajadorId,
      fechaInicio,
      fechaFin,
    );
  }

  @Get('cliente/:clienteId')
  async findByCliente(@Param('clienteId') clienteId: string) {
    this.logger.log(`GET /sesiones/cliente/${clienteId}`);
    return this.sesionesService.findByCliente(clienteId);
  }

  // ==========================================
  // ⚠️ RUTAS CON :id AL FINAL
  // ==========================================

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`GET /sesiones/${id}`);
    const sesion = await this.sesionesService.findOne(id);

    if (!sesion) {
      throw new NotFoundException(`Sesión con ID ${id} no encontrada`);
    }

    return sesion;
  }

  @Patch(':id/completar')
  @Roles(...ROLES_CLINICOS)
  async completar(
    @Param('id') id: string,
    @Body() completarSesionDto: CompletarSesionDto,
  ) {
    this.logger.log(`PATCH /sesiones/${id}/completar`);
    return this.sesionesService.completarSesion(id, completarSesionDto);
  }

  @Patch(':id/cancelar')
  @Roles(...ROLES_CLINICOS)
  async cancelar(
    @Param('id') id: string,
    @Body() cancelarSesionDto: CancelarSesionDto,
  ) {
    this.logger.log(`PATCH /sesiones/${id}/cancelar`);
    return this.sesionesService.cancelarSesion(
      id,
      cancelarSesionDto.conAviso ?? true,
    );
  }

  @Patch(':id')
  @Roles(...ROLES_CLINICOS)
  async update(@Param('id') id: string, @Body() updateDto: any) {
    this.logger.log(`PATCH /sesiones/${id}`);
    return this.sesionesService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    this.logger.warn(`DELETE /sesiones/${id}`);
    return this.sesionesService.remove(id);
  }
}