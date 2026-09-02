import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { FestivosService } from './festivos.service';
import { CreateFestivoDto } from './dto/create-festivo.dto';
import { UpdateFestivoDto } from './dto/update-festivo.dto';
import { ConfiguracionCentroDto } from './dto/configuracion-centro.dto';
import { CCAA, LOCALES, contarDiasLocales } from './data/calendarios';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';

@Controller('festivos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FestivosController {
  constructor(private readonly festivosService: FestivosService) {}

  // ── Catalogo y configuracion ───────────────────────────────
  // Van antes que `:id` para que Nest no los tome por un identificador.

  /** El catalogo cerrado que alimenta los desplegables. No hay texto libre. */
  @Get('catalogo')
  catalogo() {
    return {
      ccaa: CCAA,
      municipios: Object.entries(LOCALES).map(([nombre, m]) => ({
        nombre,
        ccaa: m.ccaa,
        provincia: m.provincia,
        /** Sin datos = declarado en el catalogo pero sin festivos cargados. */
        sinDatos: contarDiasLocales(m) === 0,
      })),
    };
  }

  @Get('configuracion')
  getConfiguracion() {
    return this.festivosService.getConfiguracion();
  }

  @Put('configuracion')
  @Roles('ADMIN')
  setConfiguracion(@Body() dto: ConfiguracionCentroDto) {
    return this.festivosService.setConfiguracion(dto);
  }

  /** Los dias que cierra el centro. Es lo que consumen agenda y avisos. */
  @Get('del-centro')
  delCentro(@Query('anio', ParseIntPipe) anio: number) {
    return this.festivosService.delCentro([anio]);
  }

  @Get('previsualizar/:anio')
  @Roles('ADMIN')
  previsualizar(@Param('anio', ParseIntPipe) anio: number) {
    return this.festivosService.previsualizarCalendario(anio);
  }

  @Post('importar/:anio')
  @Roles('ADMIN')
  importarCalendario(@Param('anio', ParseIntPipe) anio: number) {
    return this.festivosService.importarCalendario(anio);
  }

  @Get('tiene-calendario/:anio')
  tieneCalendario(@Param('anio', ParseIntPipe) anio: number) {
    return this.festivosService.tieneCalendario(anio);
  }

  // ── CRUD ───────────────────────────────────────────────────

  @Get()
  getFestivos(@Query('anio', ParseIntPipe) anio: number) {
    return this.festivosService.getFestivos(anio);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateFestivoDto) {
    return this.festivosService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateFestivoDto) {
    return this.festivosService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.festivosService.remove(id);
  }
}
