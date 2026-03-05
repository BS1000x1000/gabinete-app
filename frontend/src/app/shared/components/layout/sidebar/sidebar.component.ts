import { Component, inject } from '@angular/core';
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

  navItems: NavItem[] = [
    { label: 'Agenda',       icon: 'bi-calendar-week',  route: '/home/agenda'       },
    { label: 'Clientes',     icon: 'bi-people',          route: '/home/clientes'     },
    { label: 'Equipo',       icon: 'bi-person-badge',    route: '/home/trabajadores' },
    { label: 'Ajustes',      icon: 'bi-sliders',         route: '/home/ajustes'      },
  ];

  quickActions: QuickAction[] = [
    { label: 'Nuevo cliente',   icon: 'bi-person-plus',   action: 'nuevo-cliente'   },
    { label: 'Nuevo registro',  icon: 'bi-pencil-square', action: 'nuevo-registro'  },
    { label: 'Nueva sesión',    icon: 'bi-calendar-plus', action: 'nueva-sesion'    },
  ];

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
    this.auth.logout();
  }
}
