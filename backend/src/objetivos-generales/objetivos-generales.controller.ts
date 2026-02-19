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
import { ObjetivosGeneralesService } from './objetivos-generales.service';
import { CreateObjetivoGeneralDto, UpdateObjetivoGeneralDto } from './dto/objetivo-general.dto';

@Controller('objetivos-generales')
export class ObjetivosGeneralesController {
  private readonly logger = new Logger(ObjetivosGeneralesController.name);

  constructor(private readonly objetivosGeneralesService: ObjetivosGeneralesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createObjetivoDto: CreateObjetivoGeneralDto) {
    this.logger.log(`Creando objetivo general: ${createObjetivoDto.titulo}`);
    return this.objetivosGeneralesService.create(createObjetivoDto);
  }

  @Post('seed')
  @HttpCode(HttpStatus.CREATED)
  async seed() {
    this.logger.log('Creando objetivos generales por defecto');
    return this.objetivosGeneralesService.seed();
  }

  @Get()
  async findAll(@Query('incluirInactivos') incluirInactivos?: string) {
    this.logger.log('Obteniendo todos los objetivos generales');
    const incluir = incluirInactivos === 'true';
    return this.objetivosGeneralesService.findAll(incluir);
  }

  @Get('area/:areaId')
  async findByArea(@Param('areaId') areaId: string) {
    this.logger.log(`Obteniendo objetivos del área: ${areaId}`);
    return this.objetivosGeneralesService.findByArea(areaId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Buscando objetivo general con ID: ${id}`);
    return this.objetivosGeneralesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateObjetivoDto: UpdateObjetivoGeneralDto,
  ) {
    this.logger.log(`Actualizando objetivo general: ${id}`);
    return this.objetivosGeneralesService.update(id, updateObjetivoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    this.logger.warn(`Eliminando objetivo general: ${id}`);
    return this.objetivosGeneralesService.remove(id);
  }
}