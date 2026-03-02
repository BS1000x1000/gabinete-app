import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
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
export class HomeComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  currentUser = this.auth.currentUser;
  mobileSidebarOpen = signal(false);

  toggleMobileSidebar() {
    this.mobileSidebarOpen.update((v) => !v);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
