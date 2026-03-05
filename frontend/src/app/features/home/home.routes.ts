import { Route } from '@angular/router';
import { HomeComponent } from './home.component';

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
      { path: 'trabajadores',loadComponent: () => import('../trabajadores/trabajadores.component') },
      { path: 'ajustes',    loadComponent: () => import('../ajustes/ajustes.component').then(m => m.AjustesComponent) },
    ]
  }
] as Route[];
