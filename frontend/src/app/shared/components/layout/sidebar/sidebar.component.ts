/* sidebar.component.ts */
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavItem } from '../../../../models/nav-item';
import { SidebarService } from '../../../../services/sidebar.service';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  private router = inject(Router);
  public sidebar = inject(SidebarService);

  collapsed = this.sidebar.collapsed;
  search = this.sidebar.search;

  navItems: NavItem[] = [
    { label: 'Inicio',      icon: 'house',           route: '/home' },
    // { label: 'Agenda',      icon: 'calendar3',       route: '/agenda' },
    // { label: 'Cuadrante',   icon: 'calendar-week',   route: '/cuadrante' },
    { label: 'Ficha',       icon: 'file-earmark-text', route: '/ficha' },
    { label: 'Documentación', icon: 'folder2',       route: '/docs' },
    { label: 'Alta Drive',  icon: 'cloud-upload',    route: '/drive' }
  ];

  filteredItems = computed(() =>
    this.search()
      ? this.navItems.filter(i =>
          i.label.toLowerCase().includes(this.search().toLowerCase())
        )
      : this.navItems
  );

  onSearchInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    this.search.set(val);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}