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
import { FichajeService } from './fichaje.service';
import { CreateRegistroDiarioDto } from './dto/create-registro.dto';

@Controller('registros')
export class FichajeController {
  private readonly logger = new Logger(FichajeController.name);

  constructor(private readonly fichajeService: FichajeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateRegistroDiarioDto) {
    // TODO: Obtener trabajadorId del token JWT
    const trabajadorId = 'temp-trabajador-id'; // Temporal
    
    this.logger.log(`Creando registro diario para cliente: ${createDto.clienteId}`);
    if (createDto.objetivosGeneralesTrabajados?.length) {
      this.logger.log(`Con ${createDto.objetivosGeneralesTrabajados.length} objetivos trabajados`);
    }
    return this.fichajeService.create(createDto, trabajadorId);
  }

  @Get('cliente/:clienteId')
  async findByCliente(@Param('clienteId') clienteId: string) {
    this.logger.log(`Obteniendo registros del cliente: ${clienteId}`);
    return this.fichajeService.findByCliente(clienteId);
  }

  @Get('trabajador/:trabajadorId')
  async findByTrabajador(@Param('trabajadorId') trabajadorId: string) {
    this.logger.log(`Obteniendo registros del trabajador: ${trabajadorId}`);
    return this.fichajeService.findByTrabajador(trabajadorId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Buscando registro con ID: ${id}`);
    return this.fichajeService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: { 
      contenido: string;
      objetivosGeneralesTrabajados?: string[];
    },
  ) {
    this.logger.log(`Actualizando registro: ${id}`);
    return this.fichajeService.update(
      id, 
      updateDto.contenido,
      updateDto.objetivosGeneralesTrabajados
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    this.logger.warn(`Eliminando registro: ${id}`);
    await this.fichajeService.remove(id);
    return {
      message: 'Registro eliminado correctamente',
      id,
    };
  }
}