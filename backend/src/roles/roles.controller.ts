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
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRolDto, UpdateRolDto } from './dto/rol.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  private readonly logger = new Logger(RolesController.name);

  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRolDto: CreateRolDto) {
    this.logger.log(`Creando rol: ${createRolDto.nombreRol}`);
    return this.rolesService.create(createRolDto);
  }

  @Post('seed')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async seedRolesDefault() {
    this.logger.log('Creando roles por defecto');
    return this.rolesService.seedRolesDefault();
  }

  @Get()
  async findAll() {
    this.logger.log('Obteniendo todos los roles');
    return this.rolesService.findAll();
  }

  @Get('estadisticas')
  async getEstadisticas() {
    this.logger.log('Obteniendo estadísticas de roles');
    return this.rolesService.getEstadisticas();
  }

  @Get('codigo/:codigo')
  async findByCodigo(@Param('codigo') codigo: string) {
    this.logger.log(`Buscando rol con código: ${codigo}`);
    return this.rolesService.findByCodigo(codigo);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Buscando rol con ID: ${id}`);
    const rol = await this.rolesService.findOne(id);

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return rol;
  }

  @Patch(':id')
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateRolDto: UpdateRolDto,
  ) {
    this.logger.log(`Actualizando rol: ${id}`);
    return this.rolesService.update(id, updateRolDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    this.logger.warn(`Eliminando rol: ${id}`);
    return this.rolesService.remove(id);
  }
}