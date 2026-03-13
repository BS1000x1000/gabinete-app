import { Route } from '@angular/router';
import { ListadoComponent } from './listado.component';
import { roleGuard } from '../../../shared/guards/role.guard';

const ROLES_CLINICOS = ['ADMIN', 'PEDAGOGO', 'NEURO', 'LOGOPEDA'];

export default [
  {
    path: '',
    component: ListadoComponent,
    children: [
      // Por defecto: sesiones (tarea más frecuente del día a día)
      { path: '', redirectTo: 'sesiones', pathMatch: 'full' },

      // ── 5 tabs de la ficha ──
      {
        path: 'perfil',
        loadComponent: () =>
          import('./tabs/perfil-tab/perfil-tab.component'),
      },
      {
        path: 'sesiones',
        loadComponent: () =>
          import('./tabs/sesiones-tab/sesiones-tab.component'),
      },
      {
        path: 'bonos',
        loadComponent: () =>
          import('../../../components/bonos/bonos-tab/bonos-tab.component'),
      },
      {
        path: 'progreso',
        canActivate: [roleGuard(ROLES_CLINICOS)],
        loadComponent: () =>
          import('./tabs/progreso-tab/progreso-tab.component'),
      },
      {
        path: 'informes',
        loadComponent: () =>
          import('./tabs/informes-tab/informes-tab.component'),
      },

      // ── Rutas de soporte (no aparecen en el tab bar) ──
      {
        path: 'terapeutas',
        loadComponent: () =>
          import('./tabs/trabajador-tab/trabajador-tab.component'),
      },

      // ── Redirects de rutas legacy ──
      { path: 'registro',   redirectTo: 'progreso', pathMatch: 'full' },
      { path: 'objetivos',  redirectTo: 'progreso', pathMatch: 'full' },
    ],
  },
] as Route[];
