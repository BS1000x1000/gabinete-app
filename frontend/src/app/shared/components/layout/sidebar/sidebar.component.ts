import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

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
  private auth   = inject(AuthService);
  private router = inject(Router);

  userInitials = this.auth.userInitials;
  userName     = this.auth.userName;
  userRole     = this.auth.userRole;

  navItems: NavItem[] = [
    { label: 'Agenda',   icon: 'bi-calendar-week',  route: '/home/agenda'   },
    { label: 'Clientes', icon: 'bi-people',          route: '/home/clientes' },
    { label: 'Ajustes',  icon: 'bi-sliders',         route: '/home/ajustes'  },
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
        // Fase 3: abrirá el DrawerRegistroComponent
        break;
      case 'nueva-sesion':
        // Fase 2: abrirá el modal de nueva sesión desde la Agenda
        break;
    }
  }

  logout(): void {
    this.auth.logout();
  }
}
