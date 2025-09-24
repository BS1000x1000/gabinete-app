import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

// Define una interfaz para el objeto de usuario
export interface User {
  username: string;
  role: string;
  // Añade otros campos si los necesitas
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Simula el usuario actual de Clerk
  // En una aplicación real, esto se obtendría tras el inicio de sesión
  private currentUser: User | null = {
    username: 'Nombre Apellido',
    role: 'admin' // O 'Pedagogo', 'Logopeda', etc.
  };

  getCurrentUser(): Observable<User | null> {
    return of(this.currentUser);
  }
}