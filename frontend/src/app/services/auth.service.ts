import { HttpClient } from "@angular/common/http";
import { Injectable, signal, computed, inject } from "@angular/core";
import { Observable, tap } from "rxjs";

/* services/auth.service.ts */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /* decodeJwt = función que te devuelve el payload */
  private _token = signal<string | null>(null);
  private http = inject(HttpClient);

currentTrabajadorId = signal<string | null>(null);

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<any>('/api/auth/login', credentials).pipe(
      tap((res) => this.currentTrabajadorId.set(res.trabajadorId))
    );
  }

  logout() { this._token.set(null); }

  /* helpers */
  private decodeJwt(token: string): { sub: number; email: string } {
    return JSON.parse(atob(token.split('.')[1]));
  }
}