import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: 'login',           component: LoginComponent,           title: 'Iniciar sesion' },
  { path: 'forgot-password', component: ForgotPasswordComponent,  title: 'Recuperar acceso' },
  { path: 'reset-password',  component: ResetPasswordComponent,   title: 'Nueva contrasena' },
  {
    path: 'home',
    canActivate: [authGuard],
    loadChildren: () => import('./features/home/home.routes')
  },
  { path: '',   redirectTo: '/login', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent, title: 'Pagina no encontrada' }
];
