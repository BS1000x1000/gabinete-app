import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { BonosService } from './bonos.service';
import { CreateBonoDto } from './dto/create-bono.dto';
import { RegistrarPagoDto } from './dto/registrar-pago.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bonos')
@UseGuards(JwtAuthGuard)
export class BonosController {
  constructor(private readonly bonosService: BonosService) {}

  @Post()
  create(@Body() dto: CreateBonoDto) {
    return this.bonosService.create(dto);
  }

  @Get('cliente/:clienteId')
  findByCliente(@Param('clienteId') clienteId: string) {
    return this.bonosService.findByCliente(clienteId);
  }

  @Get('cobros-pendientes')
//   @UseGuards(RolesGuard)
//   @Roles('ADMIN')
  getCobrosPendientes() {
    return this.bonosService.getCobrosPendientes();
  }

  @Patch(':id/registrar-pago')
  registrarPago(@Param('id') id: string, @Body() dto: RegistrarPagoDto) {
    return this.bonosService.registrarPago(id, dto);
  }

  @Patch(':id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.bonosService.cancelar(id);
  }
}