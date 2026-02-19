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
} from '@nestjs/common';
import { AreasDesarrolloService } from './areas-desarrollo.service';
import { CreateAreaDesarrolloDto, UpdateAreaDesarrolloDto } from './dto/area-desarrollo.dto';

@Controller('areas-desarrollo')
export class AreasDesarrolloController {
  private readonly logger = new Logger(AreasDesarrolloController.name);

  constructor(private readonly areasDesarrolloService: AreasDesarrolloService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAreaDto: CreateAreaDesarrolloDto) {
    this.logger.log(`Creando área de desarrollo: ${createAreaDto.nombre}`);
    return this.areasDesarrolloService.create(createAreaDto);
  }

  @Post('seed')
  @HttpCode(HttpStatus.CREATED)
  async seed() {
    this.logger.log('Creando áreas de desarrollo por defecto');
    return this.areasDesarrolloService.seed();
  }

  @Get()
  async findAll(@Query('incluirInactivas') incluirInactivas?: string) {
    this.logger.log('Obteniendo todas las áreas de desarrollo');
    const incluir = incluirInactivas === 'true';
    return this.areasDesarrolloService.findAll(incluir);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Buscando área de desarrollo con ID: ${id}`);
    return this.areasDesarrolloService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAreaDto: UpdateAreaDesarrolloDto,
  ) {
    this.logger.log(`Actualizando área de desarrollo: ${id}`);
    return this.areasDesarrolloService.update(id, updateAreaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    this.logger.warn(`Eliminando área de desarrollo: ${id}`);
    return this.areasDesarrolloService.remove(id);
  }
}