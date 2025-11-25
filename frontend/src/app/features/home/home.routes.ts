import { Route } from '@angular/router';
import { HomeComponent } from './home.component';

export default [
  {
    // El path: '' aquí significa '/home'
    path: '',
    component: HomeComponent, // HomeComponent es el contenedor con el <router-outlet>
    children: [
      { path: '', redirectTo: 'agenda', pathMatch: 'full' },
      
      // La ruta final es: /home/agenda
      { path: 'agenda', loadComponent: () => import('./agenda/agenda.component') },
      
      // La ruta final es: /home/listado/:id
      { path: 'listado/:id', loadComponent: () => import('./listado/listado.component') }
    ]
  }
] as Route[];