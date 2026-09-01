import { Route } from '@angular/router';
import { TrabajadorFichaComponent } from './trabajador-ficha.component';
import { authGuard } from '../../../shared/guards/auth.guard';
import { roleGuard } from '../../../shared/guards/role.guard';
import { ROLES_CLINICOS, ROL_ADMIN } from '../../../shared/constants/roles';

export default [
  {
    path: '',
    component: TrabajadorFichaComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'perfil', pathMatch: 'full' },
      { path: 'perfil',       loadComponent: () => import('./tabs/trabajador-perfil-tab/trabajador-perfil-tab.component') },
      { path: 'clientes',     loadComponent: () => import('./tabs/trabajador-clientes-tab/trabajador-clientes-tab.component') },
      { path: 'horario',      loadComponent: () => import('./tabs/trabajador-horario-tab/trabajador-horario-tab.component') },
      { path: 'vacaciones',   loadComponent: () => import('./tabs/trabajador-vacaciones-tab/trabajador-vacaciones-tab.component') },
      { path: 'facturacion',  loadComponent: () => import('./tabs/trabajador-facturacion-tab/trabajador-facturacion-tab.component'), canActivate: [roleGuard([...ROLES_CLINICOS])] },
      { path: 'acceso',       loadComponent: () => import('./tabs/trabajador-acceso-tab/trabajador-acceso-tab.component'), canActivate: [roleGuard([ROL_ADMIN])] },
    ],
  },
] as Route[];
