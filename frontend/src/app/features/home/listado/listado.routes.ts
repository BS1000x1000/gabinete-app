import { Route } from '@angular/router';
import { ListadoComponent } from './listado.component';

export default [
  {
    path: '',
    component: ListadoComponent,
    children: [
      // Redirige por defecto a registro (uso más frecuente del día a día)
      { path: '', redirectTo: 'registro', pathMatch: 'full' },

      // ── 3 tabs de trabajo activo ──
      {
        path: 'registro',
        loadComponent: () =>
          import('./tabs/registro-tab/registro-tab.component'),
      },
      {
        path: 'objetivos',
        loadComponent: () =>
          import('./tabs/objetivos-tab/objetivos-tab.component'),
      },
      {
        path: 'informes',
        loadComponent: () =>
          import('./tabs/informes-tab/informes-tab.component'),
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
        path: 'terapeutas',
        loadComponent: () =>
          import('./tabs/trabajador-tab/trabajador-tab.component'),
      },

      // ── Rutas legacy mantenidas para compatibilidad ──
      { path: 'cliente', redirectTo: 'registro', pathMatch: 'full' },
      { path: 'contactos', redirectTo: 'registro', pathMatch: 'full' },
      { path: 'colegio', redirectTo: 'registro', pathMatch: 'full' },
      { path: 'sanitario', redirectTo: 'registro', pathMatch: 'full' },
    ],
  },
] as Route[];
