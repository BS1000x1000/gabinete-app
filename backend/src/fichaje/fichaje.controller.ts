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
  UseGuards,
  Req,
} from '@nestjs/common';
import { FichajeService } from './fichaje.service';
import { CreateRegistroDiarioDto, UpdateRegistroDiarioDto } from './dto/create-registro.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { ROLES_CLINICOS } from 'src/roles/roles.constants';
import { QueryRegistrosClienteDto } from './dto/query-registros.dto';

@Controller('registros')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ROLES_CLINICOS)
export class FichajeController {
  private readonly logger = new Logger(FichajeController.name);

  constructor(private readonly fichajeService: FichajeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateRegistroDiarioDto, @Req() req: any) {

    const trabajadorId = req.user.userId
    this.logger.log(`TRABAJADOR ID ${trabajadorId}`);
    this.logger.log(`Creando registro diario para cliente: ${createDto.clienteId}`);
    if (createDto.objetivosGeneralesTrabajados?.length) {
      this.logger.log(`Con ${createDto.objetivosGeneralesTrabajados.length} objetivos trabajados`);
      this.logger.log(`Objetivo: ${createDto.objetivosGeneralesTrabajados}`);
    }
    return this.fichajeService.create(createDto, trabajadorId, req.user);
  }

  /**
   * GET /registros/cliente/:clienteId?page&limit&desde&hasta
   *
   * `desde` y `hasta` son dias (`YYYY-MM-DD`) e incluyen los dos extremos.
   * Existen para no tener que traerse el historial entero y filtrarlo en el
   * navegador, que es lo que hacia el frontend con `?limit=500`.
   */
  @Get('cliente/:clienteId')
  async findByCliente(
    @Param('clienteId') clienteId: string,
    @Query() filtros: QueryRegistrosClienteDto,
    @Req() req: any,
  ) {
    const periodo =
      filtros.desde || filtros.hasta
        ? ` [${filtros.desde ?? '—'} … ${filtros.hasta ?? '—'}]`
        : '';
    this.logger.log(`Obteniendo registros del cliente: ${clienteId}${periodo}`);
    return this.fichajeService.findByCliente(clienteId, filtros, req.user);
  }

  @Get('trabajador/:trabajadorId')
  async findByTrabajador(
    @Param('trabajadorId') trabajadorId: string,
    @Req() req: any,
  ) {
    this.logger.log(`Obteniendo registros del trabajador: ${trabajadorId}`);
    return this.fichajeService.findByTrabajador(trabajadorId, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    this.logger.log(`Buscando registro con ID: ${id}`);
    return this.fichajeService.findOne(id, req.user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateRegistroDiarioDto,
    @Req() req: any,
  ) {
    this.logger.log(`Actualizando registro: ${id}`);
    return this.fichajeService.update(id, updateDto, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Req() req: any) {
    this.logger.warn(`Eliminando registro: ${id}`);
    await this.fichajeService.remove(id, req.user);
    return {
      message: 'Registro eliminado correctamente',
      id,
    };
  }
}