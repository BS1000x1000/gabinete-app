import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login'
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadChildren: () => import('./features/home/home.routes')
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Página no encontrada'
  }
];