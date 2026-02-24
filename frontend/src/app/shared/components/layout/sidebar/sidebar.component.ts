import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  collapsed = signal(false);

  menuItems: MenuItem[] = [
    { label: 'Inicio', icon: 'bi-house-fill', route: '/home/agenda' },
    { label: 'Agenda', icon: 'bi-calendar-check-fill', route: '/home/agenda' },
    { label: 'Clientes', icon: 'bi-people-fill', route: '/home/clientes' },
    // Agrega más items según necesites
  ];

  toggleSidebar() {
    this.collapsed.update(v => !v);
  }
}