import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

/* services/auth.service.ts */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /* decodeJwt = función que te devuelve el payload */
  private http = inject(HttpClient);
  private readonly api = 'http://localhost:3000'; // URL base de tu backend
  private readonly TOKEN_KEY = 'access_token';
  private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  private router = inject(Router);

  private _currentTrabajadorId = signal<string | null>(null);

  public currentTrabajadorId = computed(() => {
    const id = this._currentTrabajadorId();
    if (id) return id;

    // Si no hay ID en memoria pero hay token, decodificar el JWT aqui
    const token = this._token();
    if (token) {
      const payload = this.decodeJwt(token);
      console.log('Payload', payload);
      return payload.sub;
    }

    return null;
  });

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.api}/auth/login`, credentials).pipe(
      tap((res) => {
        if(res.access_token) {
          // Guardamos en localStorage para persistencia
          localStorage.setItem(this.TOKEN_KEY, res.access_token);

          // Actualizamos nuestros signals
          this._token.set(res.access_token);
          this._currentTrabajadorId.set(res.sub);
        }

      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this._token.set(null);
    this._currentTrabajadorId.set(null);
    this.router.navigate(['/login'])
  }

  /* helpers */
  private decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }
}
