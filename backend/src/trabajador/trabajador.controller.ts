// trabajador.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  ValidationPipe,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TrabajadorService } from './trabajador.service';
import { CreateTrabajadorDto } from './dto/trabajador.dto';

@Controller('trabajadores')
export class TrabajadorController {
  constructor(private readonly trabajadoresService: TrabajadorService) {}

  /* ---------- CREAR TRABAJADOR ---------- */
  @Post()
  async create(@Body(new ValidationPipe()) dto: CreateTrabajadorDto) {
    try {
      return await this.trabajadoresService.create(dto);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /* ---------- LEER TODOS LOS TRABAJADORES ---------- */
  @Get()
  async findAll() {
    try {
      return await this.trabajadoresService.findAll();
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /* ---------- LEER UN TRABAJADOR POR ID ---------- */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      return await this.trabajadoresService.findOne(id);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /* ---------- ACTUALIZAR TRABAJADOR ---------- */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe()) dto: CreateTrabajadorDto,
  ) {
    try {
      return await this.trabajadoresService.update(id, dto);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /* ---------- ELIMINAR TRABAJADOR ---------- */
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.trabajadoresService.remove(id);
      return { message: 'Trabajador eliminado correctamente' };
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}
