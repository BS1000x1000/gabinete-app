import { Route } from '@angular/router';
import { HomeComponent } from './home.component';
import { ListadoComponent } from './listado/listado.component';

export default [
  {
    // El path: '' aquí significa '/home'
    path: '',
    component: HomeComponent, // HomeComponent es el contenedor con el <router-outlet>
    children: [
      {
        path: '',
        redirectTo: 'agenda',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard-home.component').then(m => m.DashboardHomeComponent)
      },
      {
        path: 'agenda',
        loadComponent: () => import('./agenda/agenda.component').then(m => m.AgendaComponent)
      },
      {
        path: 'listado/:id',
        loadChildren: () => import('./listado/listado.routes')
      },
      {
        path: 'clientes',
        loadComponent: () => import('../clientes/clientes.component')
      },
    ]
  }
] as Route[];