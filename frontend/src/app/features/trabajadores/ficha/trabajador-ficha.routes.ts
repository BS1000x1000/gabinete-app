import { Route } from '@angular/router';
import { TrabajadorFichaComponent } from './trabajador-ficha.component';
import { authGuard } from '../../../shared/guards/auth.guard';
import { roleGuard } from '../../../shared/guards/role.guard';

export default [
  {
    path: '',
    component: TrabajadorFichaComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'perfil', pathMatch: 'full' },
      { path: 'perfil',   loadComponent: () => import('./tabs/trabajador-perfil-tab/trabajador-perfil-tab.component') },
      { path: 'clientes', loadComponent: () => import('./tabs/trabajador-clientes-tab/trabajador-clientes-tab.component') },
      { path: 'acceso',   loadComponent: () => import('./tabs/trabajador-acceso-tab/trabajador-acceso-tab.component'), canActivate: [roleGuard(['ADMIN'])] },
    ],
  },
] as Route[];
