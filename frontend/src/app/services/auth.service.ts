import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { NotificacionesService } from './notificaciones.service';
import { ROLES_ADMINISTRACION, ROLES_GESTION } from '../shared/constants/roles';

interface LoginResponse {
  token_type: string;
  expires_in: string;
  user: {
    id: string;
    username: string;
    nombre: string;
    apellidos: string;
    email: string;
    rol: {
      id: string;
      nombre: string;
      codigo: string;
    };
  };
}

interface LoginCredentials {
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private notificacionesSvc = inject(NotificacionesService);

  private readonly api = environment.apiUrl;
  private readonly USER_KEY = 'current_user';

  // Signals — el JWT es HttpOnly, el frontend solo guarda datos del usuario
  private _currentUser = signal<LoginResponse['user'] | null>(this.getUserFromStorage());

  public currentTrabajadorId = computed(() => this._currentUser()?.id ?? null);

  public currentUser = computed(() => this._currentUser());
  public isAuthenticated = computed(() => !!this._currentUser());

  public userInitials = computed(() => {
    const u = this._currentUser();
    if (!u) return '?';
    return `${u.nombre?.charAt(0) ?? ''}${u.apellidos?.charAt(0) ?? ''}`.toUpperCase();
  });

  public userName = computed(() => {
    const u = this._currentUser();
    if (!u) return '';
    return `${u.nombre} ${u.apellidos}`;
  });

  public userRole      = computed(() => this._currentUser()?.rol?.nombre ?? '');
  public userRoleCodigo = computed(() => this._currentUser()?.rol?.codigo ?? '');

  public isAdmin   = computed(() => this.userRoleCodigo() === 'ADMIN');
  public isRecep   = computed(() => this.userRoleCodigo() === 'RECEP');
  public isClinico = computed(() =>
    ['PEDAGOGO', 'NEURO', 'LOGOPEDA'].includes(this.userRoleCodigo())
  );
  public canVerTodo = computed(() =>
    (ROLES_GESTION as readonly string[]).includes(this.userRoleCodigo())
  );

  /**
   * Bloque administrativo (contratos, facturas, ingresos): es de cada autónomo,
   * la facturación no es asunto de recepción. Lista blanca, igual que el guard
   * de la ruta: el sidebar decidía por lista negra y las dos reglas habrían
   * divergido en cuanto apareciera un rol nuevo.
   */
  public canVerAdministracion = computed(() =>
    (ROLES_ADMINISTRACION as readonly string[]).includes(this.userRoleCodigo())
  );

  /*
   * Login del trabajador
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<any>(`${this.api}/auth/login`, credentials).pipe(
      tap((res) => {
        const responseData = res.data || res;

        if (responseData.user) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(responseData.user));
          this._currentUser.set(responseData.user);

          // JWT es HttpOnly — el browser lo gestiona automáticamente
          // SSE también usa la cookie (withCredentials: true)
          this.notificacionesSvc.cargar().subscribe();
          // this.notificacionesSvc.conectarSSE();
        } else {
          console.error('❌ No se recibió información del usuario del backend');
        }
      }),
      map((res) => res.data || res)
    );
  }

  /**
   * Logout del trabajador
   */
  logout() {
    // Pedir al backend que borre la cookie HttpOnly
    this.http.post(`${this.api}/auth/logout`, {}).subscribe({ error: () => {} });

    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.notificacionesSvc.desconectarSSE();

    this.router.navigate(['/login']);
  }

  /**
   * Verificar si el token es válido
   */
  verifyToken(): Observable<{ valid: boolean; user: any }> {
    return this.http.get<{ valid: boolean; user: any }>(`${this.api}/auth/verify`);
  }

  /**
   * Obtener perfil del trabajador autenticado
   */
  getProfile(): Observable<any> {
    return this.http.get(`${this.api}/auth/profile`);
  }

  /**
   * Renovar token
   */
  refreshToken(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/auth/refresh`, {}).pipe(
      tap((res: any) => {
        const responseData = res.data || res;
        if (responseData.user) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(responseData.user));
          this._currentUser.set(responseData.user);
        }
      })
    );
  }

  // ========================================
  // HELPERS PRIVADOS
  // ========================================

  /**
   * Obtener usuario de localStorage
   */
  private getUserFromStorage(): LoginResponse['user'] | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Error al parsear user de localStorage:', e);
      return null;
    }
  }

  // ========================================
  // RESET / CHANGE PASSWORD
  // ========================================

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.api}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.api}/auth/reset-password`, { token, newPassword });
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.api}/auth/change-password`, { oldPassword, newPassword });
  }
}
