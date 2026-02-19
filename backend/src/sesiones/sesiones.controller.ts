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
} from '@nestjs/common';
import { SesionesService } from './sesiones.service';
import { GenerarSesionesDto } from './dto/generar-sesiones.dto';
import { CompletarSesionDto } from './dto/completar-sesion.dto';
import { CancelarSesionDto } from './dto/cancelar-sesion.dto';

@Controller('sesiones')
export class SesionesController {
  private readonly logger = new Logger(SesionesController.name);

  constructor(private readonly sesionesService: SesionesService) {}

  @Post('generar')
  @HttpCode(HttpStatus.CREATED)
  async generarSesiones(@Body() generarSesionesDto: GenerarSesionesDto) {
    this.logger.log('Generando sesiones automáticamente desde disponibilidad');
    return this.sesionesService.generarSesiones(generarSesionesDto);
  }

  @Get('trabajador/:trabajadorId')
  async findByTrabajador(
    @Param('trabajadorId') trabajadorId: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    this.logger.log(`Obteniendo sesiones del trabajador: ${trabajadorId}`);
    return this.sesionesService.findByTrabajadorYFecha(trabajadorId, fechaInicio, fechaFin);
  }

  @Get('cliente/:clienteId')
  async findByCliente(@Param('clienteId') clienteId: string) {
    this.logger.log(`Obteniendo sesiones del cliente: ${clienteId}`);
    return this.sesionesService.findByCliente(clienteId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Buscando sesión con ID: ${id}`);
    const sesion = await this.sesionesService.findOne(id);
    
    if (!sesion) {
      throw new NotFoundException(`Sesión con ID ${id} no encontrada`);
    }
    
    return sesion;
  }

  @Patch(':id/completar')
  async completar(
    @Param('id') id: string,
    @Body() completarSesionDto: CompletarSesionDto,
  ) {
    this.logger.log(`Completando sesión: ${id}`);
    return this.sesionesService.completarSesion(id, completarSesionDto);
  }

  @Patch(':id/cancelar')
  async cancelar(
    @Param('id') id: string,
    @Body() cancelarSesionDto: CancelarSesionDto,
  ) {
    this.logger.log(`Cancelando sesión: ${id}`);
    return this.sesionesService.cancelarSesion(
      id,
      cancelarSesionDto.conAviso ?? true,
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
  ) {
    this.logger.log(`Actualizando sesión: ${id}`);
    return this.sesionesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    this.logger.warn(`Eliminando sesión: ${id}`);
    return this.sesionesService.remove(id);
  }
}