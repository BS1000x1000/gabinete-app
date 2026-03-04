import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificacionesService } from '../../services/notificaciones.service';
import { SidebarComponent } from '../../shared/components/layout/sidebar/sidebar.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';
import { DrawerRegistroComponent } from '../../shared/components/drawer-registro/drawer-registro.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    SearchBarComponent,
    NotificationBellComponent,
    DrawerRegistroComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private notificacionesSvc = inject(NotificacionesService);

  mobileSidebarOpen = signal(false);

  ngOnInit() {
    this.notificacionesSvc.cargar().subscribe();
    this.notificacionesSvc.iniciarPolling();
  }

  toggleMobileSidebar() {
    this.mobileSidebarOpen.update((v) => !v);
  }
}
