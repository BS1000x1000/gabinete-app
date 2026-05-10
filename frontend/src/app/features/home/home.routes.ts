import { Route } from '@angular/router';
import { HomeComponent } from './home.component';
import { roleGuard } from '../../shared/guards/role.guard';

const ROLES_CLINICOS = ['ADMIN', 'PEDAGOGO', 'NEURO', 'LOGOPEDA'];

export default [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: '',           redirectTo: 'agenda', pathMatch: 'full' },
      { path: 'dashboard',  loadComponent: () => import('./dashboard/dashboard-home.component').then(m => m.DashboardHomeComponent) },
      { path: 'agenda',     loadComponent: () => import('./agenda/agenda.component').then(m => m.AgendaComponent) },
      { path: 'listado/:id',loadChildren: () => import('./listado/listado.routes') },
      { path: 'clientes',   loadComponent: () => import('../clientes/clientes.component') },
      { path: 'estadisticas', loadComponent: () => import('./estadisticas/estadisticas.component').then(m => m.EstadisticasComponent) },
      { path: 'trabajadores',     loadComponent: () => import('../trabajadores/trabajadores.component'),          canActivate: [roleGuard(['ADMIN', 'RECEP'])] },
      { path: 'trabajadores/:id', loadChildren: () => import('../trabajadores/ficha/trabajador-ficha.routes'), canActivate: [roleGuard(ROLES_CLINICOS)] },
      { path: 'ajustes',    loadComponent: () => import('../ajustes/ajustes.component') },
      { path: 'administracion/festivos', loadComponent: () => import('./administracion/festivos/festivos.component'), canActivate: [roleGuard(['ADMIN'])] },
    ]
  }
] as Route[];
