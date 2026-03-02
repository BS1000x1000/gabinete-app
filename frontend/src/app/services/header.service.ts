import { Injectable, inject, signal, computed } from '@angular/core';
import { NotificacionesService } from './notificaciones.service';

@Injectable({ providedIn: 'root' })
export class HeaderService {
  private notificacionesSvc = inject(NotificacionesService);

  searchOpen = signal(false);
  notifications = computed(() => this.notificacionesSvc.contadorNoLeidas());
}
