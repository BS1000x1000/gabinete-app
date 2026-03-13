import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { NotificacionesService } from './notificaciones.service';

interface LoginResponse {
  access_token: string;
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
  
  // ✅ USAR ENVIRONMENT
  private readonly api = environment.apiUrl;
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'current_user';

  // Signals
  private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  private _currentUser = signal<LoginResponse['user'] | null>(this.getUserFromStorage());
  private _currentTrabajadorId = signal<string | null>(null);

  // Computed
  public currentTrabajadorId = computed(() => {
    // Primero intenta obtener del user guardado
    const user = this._currentUser();
    if (user?.id) return user.id;

    // Si no hay user pero hay token, decodificar
    const token = this._token();
    if (token) {
      const payload = this.decodeJwt(token);
      return payload?.sub || null;
    }

    return null;
  });

  public readonly token = this._token.asReadonly();
  public currentUser = computed(() => this._currentUser());
  public isAuthenticated = computed(() => !!this._token());

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

  public userRole     = computed(() => this._currentUser()?.rol?.nombre ?? '');
  public userRoleCodigo = computed(() => this._currentUser()?.rol?.codigo ?? '');

  // Helpers de rol para uso directo en templates y guards
  public isAdmin  = computed(() => this.userRoleCodigo() === 'ADMIN');
  public isRecep  = computed(() => this.userRoleCodigo() === 'RECEP');
  public isClinico = computed(() =>
    ['PEDAGOGO', 'NEURO', 'LOGOPEDA'].includes(this.userRoleCodigo())
  );
  public canVerTodo = computed(() =>
    ['ADMIN', 'RECEP'].includes(this.userRoleCodigo())
  );


  /*
   * Login del trabajador
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<any>(`${this.api}/auth/login`, credentials).pipe(
      tap((res) => {
        console.log('📦 Respuesta del backend:', res);
        
        // ✅ CORREGIDO: Acceder a res.data.access_token
        const responseData = res.data || res; // Por si acaso viene sin wrapper
        
        if (responseData.access_token) {
          // Guardar en localStorage
          localStorage.setItem(this.TOKEN_KEY, responseData.access_token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(responseData.user));

          // Actualizar signals
          this._token.set(responseData.access_token);
          this._currentUser.set(responseData.user);
          this._currentTrabajadorId.set(responseData.user.id);

          console.log('✅ Token guardado en localStorage');
          console.log('✅ User guardado:', responseData.user);

          // Verificar que se guardó correctamente
          const tokenGuardado = localStorage.getItem(this.TOKEN_KEY);
          console.log('🔍 Token en localStorage:', tokenGuardado ? 'SÍ ✅' : 'NO ❌');

          // Cargar notificaciones y conectar SSE
          this.notificacionesSvc.cargar().subscribe();
          this.notificacionesSvc.conectarSSE(responseData.access_token);
        } else {
          console.error('❌ No se recibió access_token del backend');
        }
      }),
      map((res) => res.data || res) // ✅ Retornar solo el data
    );
  }

  /**
   * Logout del trabajador
   */
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._token.set(null);
    this._currentUser.set(null);
    this._currentTrabajadorId.set(null);
    this.notificacionesSvc.desconectarSSE();

    console.log('👋 Sesión cerrada');
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
      tap((res) => {
        if (res.access_token) {
          localStorage.setItem(this.TOKEN_KEY, res.access_token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
          this._token.set(res.access_token);
          this._currentUser.set(res.user);
        }
      })
    );
  }

  // ========================================
  // HELPERS PRIVADOS
  // ========================================

  /**
   * Decodificar JWT
   */
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
      console.error('Error al decodificar JWT:', e);
      return null;
    }
  }

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
  // RESET PASSWORD
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
