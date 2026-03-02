import { Controller, Get, Patch, Post, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificacionesService } from './notificaciones.service';
import { MotorReglasService } from './motor-reglas.service';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionesController {
  constructor(
    private readonly notificacionesSvc: NotificacionesService,
    private readonly motorReglasSvc: MotorReglasService,
  ) {}

  @Get()
  getNotificaciones(@Request() req: any) {
    return this.notificacionesSvc.findByTrabajador(req.user.sub);
  }

  @Get('count')
  getCount(@Request() req: any) {
    return this.notificacionesSvc.countNoLeidas(req.user.sub);
  }

  @Patch('leer-todas')
  marcarTodasLeidas(@Request() req: any) {
    return this.notificacionesSvc.marcarTodasLeidas(req.user.sub);
  }

  @Patch(':id/leer')
  marcarLeida(@Param('id') id: string) {
    return this.notificacionesSvc.marcarLeida(id);
  }

  @Patch(':id/descartar')
  descartar(@Param('id') id: string) {
    return this.notificacionesSvc.descartar(id);
  }

  @Post('evaluar')
  async evaluar(@Request() req: any) {
    await this.motorReglasSvc.evaluarReglas(req.user.sub, req.user.rol);
    return this.notificacionesSvc.findByTrabajador(req.user.sub);
  }
}
