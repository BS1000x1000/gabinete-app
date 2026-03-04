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
import { TrabajadorService } from './trabajador.service';
import { CreateTrabajadorDto, UpdateTrabajadorDto } from './dto/trabajador.dto';
import { TipoSesion } from '@prisma/client';

@Controller('trabajadores')
export class TrabajadorController {
  private readonly logger = new Logger(TrabajadorController.name);

  constructor(private readonly trabajadorService: TrabajadorService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTrabajadorDto: CreateTrabajadorDto) {
    this.logger.log(`Creando trabajador: ${createTrabajadorDto.username}`);
    return this.trabajadorService.create(createTrabajadorDto);
  }

  @Get()
  async findAll(@Query('incluirInactivos') incluirInactivos?: string) {
    this.logger.log('Obteniendo todos los trabajadores');
    const incluir = incluirInactivos === 'true';
    return this.trabajadorService.findAll(incluir);
  }

  @Get('rol/:rolId')
  async findByRol(@Param('rolId') rolId: string) {
    this.logger.log(`Obteniendo trabajadores del rol: ${rolId}`);
    return this.trabajadorService.findByRol(rolId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Buscando trabajador con ID: ${id}`);
    const trabajador = await this.trabajadorService.findOne(id);
    
    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
    }
    
    return trabajador;
  }

  @Get(':id/clientes')
  async getClientesAsignados(@Param('id') id: string) {
    this.logger.log(`Obteniendo clientes asignados al trabajador: ${id}`);
    return this.trabajadorService.getClientesAsignados(id);
  }

  @Post(':trabajadorId/clientes/:clienteId')
  @HttpCode(HttpStatus.CREATED)
  async asignarCliente(
    @Param('trabajadorId') trabajadorId: string,
    @Param('clienteId') clienteId: string,
    @Body() body: { tipoTerapia: TipoSesion },
  ) {
    this.logger.log(`Asignando cliente ${clienteId} al trabajador ${trabajadorId}`);
    return this.trabajadorService.asignarCliente(
      trabajadorId, 
      clienteId, 
      body.tipoTerapia
    );
  }

  @Delete(':trabajadorId/clientes/:clienteId')
  @HttpCode(HttpStatus.OK)
  async desasignarCliente(
    @Param('trabajadorId') trabajadorId: string,
    @Param('clienteId') clienteId: string,
  ) {
    this.logger.log(`Desasignando cliente ${clienteId} del trabajador ${trabajadorId}`);
    return this.trabajadorService.desasignarCliente(trabajadorId, clienteId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTrabajadorDto: UpdateTrabajadorDto,
  ) {
    this.logger.log(`Actualizando trabajador: ${id}`);
    return this.trabajadorService.update(id, updateTrabajadorDto);
  }

  @Patch(':id/cambiar-password')
  async cambiarPassword(
    @Param('id') id: string,
    @Body() body: { passwordActual: string; passwordNueva: string },
  ) {
    this.logger.log(`Cambiando contraseña del trabajador: ${id}`);
    return this.trabajadorService.cambiarPassword(
      id,
      body.passwordActual,
      body.passwordNueva,
    );
  }

  @Patch(':id/reactivar')
  async reactivar(@Param('id') id: string) {
    this.logger.log(`Reactivando trabajador: ${id}`);
    return this.trabajadorService.reactivar(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    this.logger.warn(`Desactivando trabajador: ${id}`);
    return this.trabajadorService.remove(id);
  }
}