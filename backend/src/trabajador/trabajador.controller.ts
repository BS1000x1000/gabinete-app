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
  ForbiddenException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TrabajadorService } from './trabajador.service';
import { CreateTrabajadorDto, UpdateTrabajadorDto } from './dto/trabajador.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { TipoSesion } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { ROLES_GESTION } from '../roles/roles.constants';

@Controller('trabajadores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrabajadorController {
  private readonly logger = new Logger(TrabajadorController.name);

  constructor(private readonly trabajadorService: TrabajadorService) {}

  @Post()
  @Roles('ADMIN')
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
  async findOne(@Param('id') id: string, @Req() req: any) {
    this.logger.log(`Buscando trabajador con ID: ${id}`);
    if (!ROLES_GESTION.includes(req.user?.rol) && req.user?.userId !== id) {
      throw new ForbiddenException('No tienes permiso para ver este perfil');
    }
    const trabajador = await this.trabajadorService.findOne(id);
    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
    }
    return trabajador;
  }

  @Get(':id/clientes')
  async getClientesAsignados(@Param('id') id: string, @Req() req: any) {
    this.logger.log(`Obteniendo clientes asignados al trabajador: ${id}`);
    if (!ROLES_GESTION.includes(req.user?.rol) && req.user?.userId !== id) {
      throw new ForbiddenException('No tienes permiso para ver esta información');
    }
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
  @Roles('ADMIN')
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
    @Body() body: ChangePasswordDto,
    @Req() req: any,
  ) {
    if (req.user.userId !== id && req.user.rol !== 'ADMIN') {
      throw new ForbiddenException('No puedes cambiar la contraseña de otro usuario');
    }
    this.logger.log(`Cambiando contraseña del trabajador: ${id}`);
    return this.trabajadorService.cambiarPassword(id, body.passwordActual, body.passwordNueva);
  }

  @Patch(':id/reactivar')
  @Roles('ADMIN')
  async reactivar(@Param('id') id: string) {
    this.logger.log(`Reactivando trabajador: ${id}`);
    return this.trabajadorService.reactivar(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    this.logger.warn(`Desactivando trabajador: ${id}`);
    return this.trabajadorService.remove(id);
  }
}