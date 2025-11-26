import { Route } from '@angular/router';
import { HomeComponent } from './home.component';
import { ListadoComponent } from './listado/listado.component';

export default [
  {
    // El path: '' aquí significa '/home'
    path: '',
    component: HomeComponent, // HomeComponent es el contenedor con el <router-outlet>
    children: [
      // La ruta final es: /home/listado/:id
      { path: 'listado/:id', loadChildren: () => import('./listado/listado.routes') }
    ]
  }
] as Route[];