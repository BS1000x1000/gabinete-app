// horarios.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, ValidationPipe, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { HorariosService } from './horarios.service';
import { HorarioData } from './dto/horariodto-interface';

@Controller('horarios')
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  /* ---------- CREAR MUCHOS HORARIOS ---------- */
  @Post()
  async createMany(@Body(new ValidationPipe()) dto: HorarioData[]) {
    try {
      return await this.horariosService.createMany(dto);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /* ---------- LEER TODOS LOS HORARIOS DE UN CLIENTE ---------- */
  @Get('cliente/:id')
  async findByCliente(@Param('id') clienteId: string) {
    try {
      return await this.horariosService.findByClienteId(clienteId);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

   /* ---------- LEER TODOS LOS HORARIOS DE UN TRABAJADOR ---------- */
  @Get('trabajador/:id')
  async findByTrabajador(@Param('id') clienteId: string) {
    try {
      return await this.horariosService.findByTrabajadorId(clienteId);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /* ---------- LEER UN HORARIO POR ID ---------- */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const horario = await this.horariosService.findOne(id);
      if (!horario) throw new NotFoundException('Horario no encontrado');
      return horario;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err.message);
    }
  }

  /* ---------- ACTUALIZAR UN HORARIO ---------- */
  @Patch(':id')
  async update(@Param('id') id: string, @Body(new ValidationPipe()) dto: HorarioData) {
    try {
      return await this.horariosService.update(id, dto);
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  /* ---------- ELIMINAR UN HORARIO ---------- */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.horariosService.remove(id);
      return { message: 'Horario eliminado correctamente' };
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }
}