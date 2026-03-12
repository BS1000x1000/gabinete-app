import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { BonosService } from './bonos.service';
import { CreateBonoDto } from './dto/create-bono.dto';
import { RegistrarPagoDto } from './dto/registrar-pago.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { ROLES_GESTION } from '../roles/roles.constants';

@Controller('bonos')
@UseGuards(JwtAuthGuard, RolesGuard)
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
  @Roles(...ROLES_GESTION)
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