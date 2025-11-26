import { Route } from '@angular/router';
import { ListadoComponent } from './listado.component';

export default [
  {
    path: '',
    component: ListadoComponent,
    children: [
      {path: '', redirectTo: 'cliente', pathMatch: 'full'},
      {path: 'cliente', loadComponent: () => import('./tabs/cliente-tab/cliente-tab.component')},
      {path: 'contactos', loadComponent: () => import('./tabs/contactos-tab/contactos-tab.component')},
      {path: 'colegio', loadComponent: () => import('./tabs/colegio-tab/colegio-tab.component')},
      {path: 'sanitario', loadComponent: () => import('./tabs/sanitario-tab/sanitario-tab.component')}
    ]
  }
] as Route[];