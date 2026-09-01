import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

interface SubNavItem {
  label: string;
  icon: string;
  route: string;
}

/**
 * Configuración del centro: los catálogos y calendarios que comparte todo el
 * gabinete y que solo toca el ADMIN.
 *
 * Existe porque los festivos estaban colgados de "Administración", entre las
 * facturas y los contratos, cuando no tienen nada que ver con facturar: los
 * consumen `contratos` y `sesiones` para saber qué días no se genera agenda. No
 * había dónde ponerlos — `/home/ajustes` redirige a la cuenta personal — así que
 * acabaron ahí. Aquí es donde irán los siguientes catálogos (objetivos
 * generales, plantillas de informe, roles).
 */
@Component({
  selector: 'app-configuracion-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
<div class="adm-shell">

  <div class="adm-header">
    <h1 class="adm-header-title">
      <i class="bi bi-sliders"></i>
      Configuración
    </h1>
  </div>

  <nav class="adm-subnav">
    @for (item of tabs; track item.route) {
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
export default class ConfiguracionShellComponent {
  readonly tabs: SubNavItem[] = [
    { label: 'Festivos', icon: 'bi-calendar2-check', route: 'festivos' },
  ];
}
