import { Route } from '@angular/router';
import { HomeComponent } from './home.component';
import { roleGuard } from '../../shared/guards/role.guard';

const ROLES_FICHA = ['ADMIN', 'PEDAGOGO', 'NEURO', 'LOGOPEDA', 'RECEP'];

export default [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: '',           redirectTo: 'agenda', pathMatch: 'full' },
      { path: 'agenda',     loadComponent: () => import('./agenda/agenda.component').then(m => m.AgendaComponent) },
      { path: 'listado/:id',loadChildren: () => import('./listado/listado.routes') },
      { path: 'clientes',   loadComponent: () => import('../clientes/clientes.component') },
      { path: 'estadisticas', loadComponent: () => import('./estadisticas/estadisticas.component').then(m => m.EstadisticasComponent) },
      { path: 'trabajadores',     loadComponent: () => import('../trabajadores/trabajadores.component'),          canActivate: [roleGuard(['ADMIN', 'RECEP'])] },
      { path: 'trabajadores/:id', loadChildren: () => import('../trabajadores/ficha/trabajador-ficha.routes'), canActivate: [roleGuard(ROLES_FICHA)] },
      { path: 'cuenta',     loadComponent: () => import('./cuenta/cuenta.component') },
      { path: 'ajustes',    redirectTo: 'cuenta', pathMatch: 'full' },
      {
        path: 'administracion',
        canActivate: [roleGuard(['ADMIN', 'PEDAGOGO', 'NEURO', 'LOGOPEDA'])],
        loadComponent: () => import('./administracion/administracion-shell.component'),
        children: [
          { path: '',            redirectTo: 'mis-contratos', pathMatch: 'full' },
          { path: 'mis-contratos', loadComponent: () => import('./administracion/mis-contratos/mis-contratos.component') },
          { path: 'mis-facturas',  loadComponent: () => import('./administracion/mis-facturas/mis-facturas.component')  },
          { path: 'mis-ingresos',  loadComponent: () => import('./administracion/mis-ingresos/mis-ingresos.component')  },
          { path: 'supervision',   loadComponent: () => import('./administracion/supervision/supervision.component'),   canActivate: [roleGuard(['ADMIN'])] },
          { path: 'festivos',      loadComponent: () => import('./administracion/festivos/festivos.component'),         canActivate: [roleGuard(['ADMIN'])] },
        ],
      },
    ]
  }
] as Route[];
