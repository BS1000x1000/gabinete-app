import { Component, inject, computed, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { RegistroDrawerService } from '../../../../services/registro-drawer.service';
import { NuevaSesionModalService } from '../../../../services/nueva-sesion-modal.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

interface QuickAction {
  label: string;
  icon: string;
  action: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private auth              = inject(AuthService);
  private router            = inject(Router);
  private registroDrawerSvc = inject(RegistroDrawerService);
  private nuevaSesionSvc    = inject(NuevaSesionModalService);

  userInitials = this.auth.userInitials;
  userName     = this.auth.userName;
  userRole     = this.auth.userRole;

  readonly dropdownAbierto = signal(false);

  readonly navItems = computed<NavItem[]>(() => {
    const items: NavItem[] = [
      { label: 'Agenda',        icon: 'bi-calendar-week',  route: '/home/agenda'        },
      { label: 'Clientes',      icon: 'bi-people',          route: '/home/clientes'      },
      { label: 'Estadísticas',  icon: 'bi-bar-chart-line',  route: '/home/estadisticas'  },
    ];
    if (this.auth.isAdmin() || this.auth.isRecep()) {
      items.push({ label: 'Equipo', icon: 'bi-person-badge', route: '/home/trabajadores' });
    }
    if (this.auth.canVerAdministracion()) {
      items.push({ label: 'Administración', icon: 'bi-receipt', route: '/home/administracion' });
    }
    if (this.auth.isAdmin()) {
      items.push({ label: 'Configuración', icon: 'bi-sliders', route: '/home/configuracion' });
    }
    return items;
  });

  readonly quickActions = computed<QuickAction[]>(() => {
    const actions: QuickAction[] = [
      { label: 'Nuevo cliente', icon: 'bi-person-plus', action: 'nuevo-cliente' },
    ];
    if (!this.auth.isRecep()) {
      actions.push({ label: 'Nuevo registro', icon: 'bi-pencil-square', action: 'nuevo-registro' });
      actions.push({ label: 'Nueva sesión',   icon: 'bi-calendar-plus', action: 'nueva-sesion'   });
    }
    return actions;
  });

  /**
   * "Mi ficha" y no "Mi perfil": es la misma pantalla con la que un ADMIN
   * supervisa a otro, y ahora reúne todo lo personal —perfil, semana,
   * vacaciones, datos fiscales y contraseña—. La entrada "Mi cuenta", que solo
   * llevaba al cambio de contraseña, sobra.
   */
  readonly miFichaRoute = computed(() => {
    const id = this.auth.currentTrabajadorId();
    return id ? `/home/trabajadores/${id}` : null;
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.dropdownAbierto()) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.sidebar-profile-dropdown-wrap')) {
      this.dropdownAbierto.set(false);
    }
  }

  toggleDropdown(): void {
    this.dropdownAbierto.update(v => !v);
  }

  handleQuickAction(action: string): void {
    switch (action) {
      case 'nuevo-cliente':
        this.router.navigate(['/home/clientes'], { queryParams: { nuevo: true } });
        break;
      case 'nuevo-registro':
        this.registroDrawerSvc.openVacio();
        break;
      case 'nueva-sesion':
        this.nuevaSesionSvc.open();
        break;
    }
  }

  logout(): void {
    this.dropdownAbierto.set(false);
    this.auth.logout();
  }
}
