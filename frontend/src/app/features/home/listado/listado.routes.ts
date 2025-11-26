import { Route } from '@angular/router';
import { ListadoComponent } from './listado.component';

export default [
  {
    path: '',
    component: ListadoComponent,
    children: [
      {path: '', redirectTo: 'cliente', pathMatch: 'full'},
      {path: 'cliente', loadComponent: () => import('./tabs/cliente-tab/cliente-tab.component')},
      {path: 'contactos', loadComponent: () => import('./tabs/contactos-tab/contactos-tab.component')}
    ]
  }
] as Route[];