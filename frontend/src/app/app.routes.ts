import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UsuarioComponent } from './usuario/usuario.component';

export const routes: Routes = [
//   { path: 'students', component: StudentsComponent, title: 'Students' },

  // Ruta para la página de profesores
  { path: 'login', component: LoginComponent, title: 'Login'},

  // Ruta para la página de profesores
  { path: 'usuario', component: UsuarioComponent, title: 'Usuario' },

  // Ruta por defecto que redirige a la página de estudiantes
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Ruta wildcard para cualquier otra URL (manejo de errores 404)
//   { path: '**', component: PageNotFoundComponent, title: 'Page Not Found' },
];
