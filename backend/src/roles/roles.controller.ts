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
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRolDto, UpdateRolDto } from './dto/rol.dto';

@Controller('roles')
export class RolesController {
  private readonly logger = new Logger(RolesController.name);

  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRolDto: CreateRolDto) {
    this.logger.log(`Creando rol: ${createRolDto.nombreRol}`);
    return this.rolesService.create(createRolDto);
  }

  @Post('seed')
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
  async update(
    @Param('id') id: string,
    @Body() updateRolDto: UpdateRolDto,
  ) {
    this.logger.log(`Actualizando rol: ${id}`);
    return this.rolesService.update(id, updateRolDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    this.logger.warn(`Eliminando rol: ${id}`);
    return this.rolesService.remove(id);
  }
}