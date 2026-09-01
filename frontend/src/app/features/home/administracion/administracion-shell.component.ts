import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

interface SubNavItem {
  label: string;
  icon:  string;
  route: string;
}

@Component({
  selector: 'app-administracion-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
<div class="adm-shell">

  <div class="adm-header">
    <h1 class="adm-header-title">
      <i class="bi bi-receipt"></i>
      Administración
    </h1>
  </div>

  <nav class="adm-subnav">
    @for (item of tabs(); track item.route) {
      <a
        class="adm-subnav-item"
        [routerLink]="item.route"
        routerLinkActive="is-active"
        [title]="item.label"
      >
        <i [class]="'bi ' + item.icon"></i>
        <span>{{ item.label }}</span>
      </a>
    }
  </nav>

  <div class="adm-content">
    <router-outlet />
  </div>

</div>
  `,
})
export default class AdministracionShellComponent {
  private auth = inject(AuthService);

  readonly tabs = computed<SubNavItem[]>(() => {
    const items: SubNavItem[] = [
      { label: 'Mis contratos',      icon: 'bi-file-earmark-ruled', route: 'mis-contratos'  },
      { label: 'Facturación',        icon: 'bi-receipt',            route: 'facturacion'    },
      { label: 'Mis datos fiscales', icon: 'bi-person-vcard',       route: 'datos-fiscales' },
    ];
    if (this.auth.isAdmin()) {
      items.push({ label: 'Supervisión', icon: 'bi-binoculars', route: 'supervision' });
    }
    return items;
  });
}
