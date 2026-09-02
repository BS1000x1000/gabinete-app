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
import { CreateTrabajadorDto, UpdateTrabajadorDto, UpdateMeDto, DatosFiscalesDto } from './dto/trabajador.dto';
import { AdminSetPasswordDto } from './dto/admin-set-password.dto';
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

  @Get('me')
  async getMe(@Req() req: any) {
    this.logger.log(`GET /trabajadores/me - userId: ${req.user.userId}`);
    const trabajador = await this.trabajadorService.findOne(req.user.userId);
    if (!trabajador) throw new NotFoundException('Trabajador no encontrado');
    return trabajador;
  }

  /**
   * Perfil propio. Toma `UpdateMeDto` y NO `UpdateTrabajadorDto`: ese incluye
   * `rolId` y `activo`, con lo que cualquier usuario autenticado podia
   * ascenderse a ADMIN de una sola peticion -y `GET /roles`, abierto a todo
   * autenticado, le daba el id que necesitaba-.
   */
  @Patch('me')
  async updateMe(@Req() req: any, @Body() dto: UpdateMeDto) {
    this.logger.log(`PATCH /trabajadores/me - userId: ${req.user.userId}`);
    return this.trabajadorService.update(req.user.userId, dto);
  }

  @Patch('me/datos-fiscales')
  async updateDatosFiscales(@Req() req: any, @Body() dto: DatosFiscalesDto) {
    this.logger.log(`PATCH /trabajadores/me/datos-fiscales - userId: ${req.user.userId}`);
    return this.trabajadorService.updateDatosFiscales(req.user.userId, dto);
  }

  @Patch('me/cambiar-password')
  async cambiarPasswordMe(@Req() req: any, @Body() body: { passwordActual: string; passwordNueva: string }) {
    this.logger.log(`PATCH /trabajadores/me/cambiar-password - userId: ${req.user.userId}`);
    return this.trabajadorService.cambiarPassword(req.user.userId, body.passwordActual, body.passwordNueva);
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

  /**
   * Asignar y desasignar exigen el mismo permiso que LEER la lista
   * (`GET :id/clientes`, mas arriba): gestion, o uno sobre si mismo. No tenian
   * ninguna comprobacion, asi que cualquier usuario autenticado con acceso a la
   * ficha podia mover la cartera de clientes de otro terapeuta.
   */
  @Post(':trabajadorId/clientes/:clienteId')
  @HttpCode(HttpStatus.CREATED)
  async asignarCliente(
    @Param('trabajadorId') trabajadorId: string,
    @Param('clienteId') clienteId: string,
    @Body() body: { tipoTerapia: TipoSesion },
    @Req() req: any,
  ) {
    this.assertGestionOPropio(req, trabajadorId);
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
    @Req() req: any,
  ) {
    this.assertGestionOPropio(req, trabajadorId);
    this.logger.log(`Desasignando cliente ${clienteId} del trabajador ${trabajadorId}`);
    return this.trabajadorService.desasignarCliente(trabajadorId, clienteId);
  }

  /** ROLES_GESTION ve y toca cualquier ficha; el resto, solo la suya. */
  private assertGestionOPropio(req: any, trabajadorId: string): void {
    if (!ROLES_GESTION.includes(req.user?.rol) && req.user?.userId !== trabajadorId) {
      throw new ForbiddenException('No tienes permiso sobre este trabajador');
    }
  }

  @Patch(':id/datos-fiscales')
  async updateDatosFiscalesDe(@Param('id') id: string, @Req() req: any, @Body() dto: DatosFiscalesDto) {
    this.logger.log(`PATCH /trabajadores/${id}/datos-fiscales - userId: ${req.user.userId}`);
    if (req.user.rol !== 'ADMIN' && req.user.userId !== id) {
      throw new ForbiddenException('No tienes permiso para editar los datos fiscales de este trabajador');
    }
    return this.trabajadorService.updateDatosFiscales(id, dto);
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
  @Roles('ADMIN')
  async cambiarPassword(
    @Param('id') id: string,
    @Body() body: AdminSetPasswordDto,
  ) {
    this.logger.log(`Admin establece nueva contraseña para trabajador: ${id}`);
    return this.trabajadorService.setPasswordAdmin(id, body.passwordNueva);
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