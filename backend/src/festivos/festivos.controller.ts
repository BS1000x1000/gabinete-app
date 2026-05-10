import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { FestivosService } from './festivos.service';
import { CreateFestivoDto } from './dto/create-festivo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';

@Controller('festivos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FestivosController {
  constructor(private readonly festivosService: FestivosService) {}

  @Get()
  getFestivos(
    @Query('anio', ParseIntPipe) anio: number,
    @Query('ccaa') ccaa?: string,
    @Query('provincia') provincia?: string,
  ) {
    return this.festivosService.getFestivos(anio, ccaa, provincia);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateFestivoDto) {
    return this.festivosService.create(dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.festivosService.remove(id);
  }

  @Post('importar-nacionales/:anio')
  @Roles('ADMIN')
  importarNacionales(@Param('anio', ParseIntPipe) anio: number) {
    return this.festivosService.importarNacionales(anio);
  }

  @Get('tiene-nacionales/:anio')
  tieneNacionales(@Param('anio', ParseIntPipe) anio: number) {
    return this.festivosService.tieneNacionales(anio);
  }
}
