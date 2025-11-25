import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
  //   { path: 'students', component: StudentsComponent, title: 'Students' },

  // Ruta para la página de profesores
  { path: 'login', component: LoginComponent, title: 'Login' },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.routes') 
  },

  // Ruta por defecto que redirige a la página de estudiantes
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Ruta wildcard para cualquier otra URL (manejo de errores 404)
  //   { path: '**', component: PageNotFoundComponent, title: 'Page Not Found' },
];
