import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

/* services/auth.service.ts */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /* decodeJwt = función que te devuelve el payload */
  private http = inject(HttpClient);
  private readonly api = 'http://localhost:3000'; // URL base de tu backend
  private readonly TOKEN_KEY = 'access_token';
  private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

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

  constructor() {
    const token = this._token();
    if (token) {
      const payload: any = this.decodeJwt(token);
      this._currentTrabajadorId.set(payload?.sub || null);
    }
  }

  login(credentials: { usuario: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.api}/auth/login`, credentials)
    .pipe(
      tap((res) => {
        // Guardamos en localStorage para persistencia
        localStorage.setItem(this.TOKEN_KEY, res.access_token);

        // Actualizamos nuestros signals
        this._token.set(res.access_token);
        this._currentTrabajadorId.set(res.sub);
      })
    );
  }

  logout() {
    this._token.set(null);
  }

  /* helpers */
  private decodeJwt(token: string): {
    usuario: string;
    sub: string;
    rol: string;
  } {
    return JSON.parse(atob(token.split('.')[1]));
  }
}
