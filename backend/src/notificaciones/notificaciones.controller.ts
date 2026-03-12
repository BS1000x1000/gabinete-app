import { Controller, Get, Patch, Post, Param, UseGuards, Request, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { JwtFlexGuard } from '../auth/guards/jwt-flex.guard';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesSseService } from './notificaciones-sse.service';
import { MotorReglasService } from './motor-reglas.service';

@Controller('notificaciones')
@UseGuards(JwtFlexGuard)
export class NotificacionesController {
  constructor(
    private readonly notificacionesSvc: NotificacionesService,
    private readonly motorReglasSvc: MotorReglasService,
    private readonly sseSvc: NotificacionesSseService,
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

  @Sse('stream')
  stream(@Request() req: any): Observable<MessageEvent> {
    return this.sseSvc.getOrCreate(req.user.sub).asObservable();
  }

  @Post('evaluar')
  async evaluar(@Request() req: any) {
    await this.motorReglasSvc.evaluarReglas(req.user.sub, req.user.rol);
    return this.notificacionesSvc.findByTrabajador(req.user.sub);
  }
}
