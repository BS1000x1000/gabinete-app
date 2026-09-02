import { Route } from '@angular/router';
import { HomeComponent } from './home.component';
import { roleGuard } from '../../shared/guards/role.guard';
import { miFichaGuard } from '../../shared/guards/mi-ficha.guard';
import {
  ROLES_ADMINISTRACION,
  ROLES_FICHA,
  ROLES_GESTION,
  ROL_ADMIN,
} from '../../shared/constants/roles';

export default [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: '',           redirectTo: 'agenda', pathMatch: 'full' },
      { path: 'agenda',     loadComponent: () => import('./agenda/agenda.component').then(m => m.AgendaComponent) },
      { path: 'listado/:id',loadChildren: () => import('./listado/listado.routes') },
      { path: 'clientes',   loadComponent: () => import('../clientes/clientes.component') },
      // Abierta a todo el que tiene ficha de trabajador, a propósito: los datos
      // ya vienen acotados por rol desde el backend (`dashboard.controller.ts`
      // impone el userId propio a quien no sea ADMIN/RECEP). El guard está para
      // que la lista de roles sea explícita y no se cuele un rol nuevo sin más.
      { path: 'estadisticas', canActivate: [roleGuard([...ROLES_FICHA])], loadComponent: () => import('./estadisticas/estadisticas.component').then(m => m.EstadisticasComponent) },
      { path: 'trabajadores',     loadComponent: () => import('../trabajadores/trabajadores.component'),          canActivate: [roleGuard([...ROLES_GESTION])] },
      { path: 'trabajadores/:id', loadChildren: () => import('../trabajadores/ficha/trabajador-ficha.routes'), canActivate: [roleGuard([...ROLES_FICHA])] },
      // "Mi cuenta" era una pantalla entera para un solo campo, la contraseña,
      // que ahora vive en la pestaña Acceso de la propia ficha. Las dos rutas se
      // conservan como redirección: estaban en el menú del avatar.
      { path: 'cuenta',     canActivate: [miFichaGuard('acceso')], children: [] },
      { path: 'ajustes',    canActivate: [miFichaGuard('acceso')], children: [] },
      {
        path: 'administracion',
        canActivate: [roleGuard([...ROLES_ADMINISTRACION])],
        loadComponent: () => import('./administracion/administracion-shell.component'),
        children: [
          { path: '',               redirectTo: 'facturacion', pathMatch: 'full' },
          { path: 'mis-contratos',  loadComponent: () => import('./administracion/mis-contratos/mis-contratos.component') },
          { path: 'facturacion',    loadComponent: () => import('./administracion/facturacion/facturacion.component') },
          { path: 'datos-fiscales', loadComponent: () => import('../trabajadores/ficha/tabs/trabajador-facturacion-tab/trabajador-facturacion-tab.component') },
          { path: 'supervision',    loadComponent: () => import('./administracion/supervision/supervision.component'), canActivate: [roleGuard([ROL_ADMIN])] },

          // ── Rutas legacy ──
          // "Mis facturas" y "Mis ingresos" eran dos pestañas sobre los mismos
          // datos; ahora son las dos vistas de "Facturación".
          { path: 'mis-facturas', redirectTo: 'facturacion', pathMatch: 'full' },
          { path: 'mis-ingresos', redirectTo: 'facturacion', pathMatch: 'full' },
          // Los festivos son configuración de calendario, no facturación.
          { path: 'festivos',     redirectTo: '/home/configuracion/festivos', pathMatch: 'full' },
        ],
      },
      {
        path: 'configuracion',
        canActivate: [roleGuard([ROL_ADMIN])],
        loadComponent: () => import('./configuracion/configuracion-shell.component'),
        children: [
          { path: '',         redirectTo: 'festivos', pathMatch: 'full' },
          { path: 'festivos', loadComponent: () => import('./configuracion/festivos/festivos.component') },
        ],
      },
    ]
  }
] as Route[];
