import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { SidebarComponent } from '../../shared/components/layout/sidebar/sidebar.component';
import { AgendaCompactComponent } from '../../components/agenda-compact/agenda-compact.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    AgendaCompactComponent,
    SearchBarComponent,
    NotificationBellComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private notificacionesSvc = inject(NotificacionesService);

  currentUser = this.auth.currentUser;
  mobileSidebarOpen = signal(false);

  ngOnInit() {
    // Cargar notificaciones al montar el layout (cubre recargas de página)
    this.notificacionesSvc.cargar().subscribe();
    this.notificacionesSvc.iniciarPolling();
  }

  toggleMobileSidebar() {
    this.mobileSidebarOpen.update((v) => !v);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
