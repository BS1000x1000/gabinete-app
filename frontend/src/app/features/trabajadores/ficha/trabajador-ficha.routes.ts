import { Route } from '@angular/router';
import { TrabajadorFichaComponent } from './trabajador-ficha.component';
import { authGuard } from '../../../shared/guards/auth.guard';
import { roleGuard } from '../../../shared/guards/role.guard';
import { ROLES_CLINICOS } from '../../../shared/constants/roles';

export default [
  {
    path: '',
    component: TrabajadorFichaComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'perfil', pathMatch: 'full' },
      { path: 'perfil',       loadComponent: () => import('./tabs/trabajador-perfil-tab/trabajador-perfil-tab.component') },
      { path: 'clientes',     loadComponent: () => import('./tabs/trabajador-clientes-tab/trabajador-clientes-tab.component') },

      // "Mi semana" y "Vacaciones" van con guard porque sus backends son
      // ROLES_CLINICOS: sin el, RECEP entraba y se comia un 403 mudo.
      { path: 'semana',       loadComponent: () => import('./tabs/trabajador-semana-tab/trabajador-semana-tab.component'), canActivate: [roleGuard([...ROLES_CLINICOS])] },
      { path: 'vacaciones',   loadComponent: () => import('./tabs/trabajador-vacaciones-tab/trabajador-vacaciones-tab.component'), canActivate: [roleGuard([...ROLES_CLINICOS])] },
      { path: 'facturacion',  loadComponent: () => import('./tabs/trabajador-facturacion-tab/trabajador-facturacion-tab.component'), canActivate: [roleGuard([...ROLES_CLINICOS])] },

      // Acceso deja de ser solo-ADMIN: aqui se cambia la propia contrasena, que
      // antes vivia sola en /home/cuenta. Las cards de rol y baja siguen siendo
      // solo del ADMIN, gateadas dentro del componente.
      { path: 'acceso',       loadComponent: () => import('./tabs/trabajador-acceso-tab/trabajador-acceso-tab.component') },

      // Ruta legacy: la pestana se llamaba "Horario" y solo tenia la mitad.
      { path: 'horario',      redirectTo: 'semana', pathMatch: 'full' },
    ],
  },
] as Route[];
