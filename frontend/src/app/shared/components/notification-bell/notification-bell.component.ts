import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificacionesService } from '../../../services/notificaciones.service';
import { PRIORIDAD_CONFIG, Notificacion, PrioridadNotif } from '../../../interface/notificacion.interface';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
})
export class NotificationBellComponent {
  private router = inject(Router);
  notificacionesSvc = inject(NotificacionesService);

  isOpen = signal(false);
  prioridadConfig = PRIORIDAD_CONFIG;

  // Grupos por prioridad para el panel
  readonly prioridades: PrioridadNotif[] = ['URGENTE', 'ALTA', 'MEDIA', 'BAJA'];

  notificacionesPorPrioridad(prioridad: PrioridadNotif): Notificacion[] {
    return this.notificacionesSvc
      .notificaciones()
      .filter((n) => !n.descartada && n.prioridad === prioridad);
  }

  tieneGrupo(prioridad: PrioridadNotif): boolean {
    return this.notificacionesPorPrioridad(prioridad).length > 0;
  }

  togglePanel(event: Event) {
    event.stopPropagation();
    this.isOpen.update((v) => !v);
  }

  cerrarPanel() {
    this.isOpen.set(false);
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.isOpen()) this.isOpen.set(false);
  }

  onNotifClick(notif: Notificacion, event: Event) {
    event.stopPropagation();
    if (!notif.leida) {
      this.notificacionesSvc.marcarLeida(notif.id).subscribe();
    }
    if (notif.accionUrl) {
      this.router.navigateByUrl(notif.accionUrl);
      this.isOpen.set(false);
    }
  }

  onDescartar(notifId: string, event: Event) {
    event.stopPropagation();
    this.notificacionesSvc.descartar(notifId).subscribe();
  }

  onMarcarTodas(event: Event) {
    event.stopPropagation();
    this.notificacionesSvc.marcarTodasLeidas().subscribe();
  }
}
