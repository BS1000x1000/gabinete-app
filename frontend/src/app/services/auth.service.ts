import { HttpClient } from "@angular/common/http";
import { Injectable, signal, computed, inject } from "@angular/core";
import { tap } from "rxjs";

/* services/auth.service.ts */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /* decodeJwt = función que te devuelve el payload */
  private _token = signal<string | null>(null);
  private http = inject(HttpClient);

  readonly currentTeacherId = computed(() => {
    const t = this._token();
    if (!t) return null;
    return this.decodeJwt(t).sub;   // number
  });

  login(email: string, pwd: string) {
    return this.http.post<{accessToken:string}>('/api/auth/login', {email, pwd})
      .pipe(tap(r => this._token.set(r.accessToken)));
  }

  logout() { this._token.set(null); }

  /* helpers */
  private decodeJwt(token: string): { sub: number; email: string } {
    return JSON.parse(atob(token.split('.')[1]));
  }
}