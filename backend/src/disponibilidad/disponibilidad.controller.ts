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
} from '@nestjs/common';
import { DisponibilidadService } from './disponibilidad.service';
import { CreateDisponibilidadDto } from './dto/create-disponibilidad.dto';

@Controller('disponibilidad')
export class DisponibilidadController {
  private readonly logger = new Logger(DisponibilidadController.name);

  constructor(private readonly disponibilidadService: DisponibilidadService) {}

  @Post('cliente/:clienteId')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('clienteId') clienteId: string,
    @Body() createDisponibilidadDto: CreateDisponibilidadDto,
  ) {
    this.logger.log(`Creando disponibilidad para cliente: ${clienteId}`);
    return this.disponibilidadService.create(clienteId, createDisponibilidadDto);
  }

  @Get('cliente/:clienteId')
  async findByCliente(@Param('clienteId') clienteId: string) {
    this.logger.log(`Obteniendo disponibilidad del cliente: ${clienteId}`);
    return this.disponibilidadService.findByCliente(clienteId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: { horaInicio?: string; horaFin?: string },
  ) {
    this.logger.log(`Actualizando disponibilidad: ${id}`);
    return this.disponibilidadService.update(id, updateDto.horaInicio, updateDto.horaFin);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    this.logger.log(`Eliminando disponibilidad: ${id}`);
    return this.disponibilidadService.remove(id);
  }

  @Delete('cliente/:clienteId/all')
  @HttpCode(HttpStatus.OK)
  async removeAll(@Param('clienteId') clienteId: string) {
    this.logger.log(`Eliminando toda la disponibilidad del cliente: ${clienteId}`);
    return this.disponibilidadService.removeAllByCliente(clienteId);
  }
}