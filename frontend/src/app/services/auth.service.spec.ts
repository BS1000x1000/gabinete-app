import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from './auth.service';
import { NotificacionesService } from './notificaciones.service';
import { environment } from '../../environments/environment.development';

const API = environment.apiUrl;
const TOKEN_KEY = 'access_token';
const USER_KEY = 'current_user';

const mockUser = {
  id: 'trabajador-1',
  username: 'ana.garcia',
  nombre: 'Ana',
  apellidos: 'García López',
  email: 'ana@gabinete.es',
  rol: { id: 'rol-1', nombre: 'Terapeuta', codigo: 'TERAPEUTA' },
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear(); // siempre limpio antes de crear el servicio

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Computed signals — estado sin sesión ─────────────────────────

  describe('cuando no hay sesión activa', () => {
    it('isAuthenticated es false', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('currentUser es null', () => {
      expect(service.currentUser()).toBeNull();
    });

    it('currentTrabajadorId es null', () => {
      expect(service.currentTrabajadorId()).toBeNull();
    });

    it('userInitials devuelve ?', () => {
      expect(service.userInitials()).toBe('?');
    });

    it('userName devuelve cadena vacía', () => {
      expect(service.userName()).toBe('');
    });

    it('userRole devuelve cadena vacía', () => {
      expect(service.userRole()).toBe('');
    });
  });

  // ── Computed signals — con sesión en localStorage ────────────────

  describe('cuando hay token y usuario en localStorage', () => {
    beforeEach(() => {
      localStorage.setItem(TOKEN_KEY, 'fake-jwt-token');
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      // Re-crear el servicio para que lea el localStorage inicializado
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      });
      service = TestBed.inject(AuthService);
      httpMock = TestBed.inject(HttpTestingController);
    });

    it('isAuthenticated es true', () => {
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('currentUser devuelve el usuario guardado', () => {
      expect(service.currentUser()).toEqual(mockUser);
    });

    it('currentTrabajadorId devuelve el id del usuario', () => {
      expect(service.currentTrabajadorId()).toBe('trabajador-1');
    });

    it('userInitials devuelve las iniciales correctas', () => {
      expect(service.userInitials()).toBe('AG');
    });

    it('userName devuelve nombre completo', () => {
      expect(service.userName()).toBe('Ana García López');
    });

    it('userRole devuelve el nombre del rol', () => {
      expect(service.userRole()).toBe('Terapeuta');
    });
  });

  // ── login() ──────────────────────────────────────────────────────

  describe('login()', () => {
    let notifSvc: NotificacionesService;

    beforeEach(() => {
      notifSvc = TestBed.inject(NotificacionesService);
      spyOn(notifSvc, 'cargar').and.returnValue(of([]));
      spyOn(notifSvc, 'iniciarPolling');
    });

    it('hace POST a /auth/login con las credenciales', () => {
      service.login({ username: 'ana', password: '1234' }).subscribe();
      const req = httpMock.expectOne(`${API}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'ana', password: '1234' });
      req.flush({ access_token: 'tok', user: mockUser });
    });

    it('guarda el token en localStorage tras login exitoso', () => {
      service.login({ username: 'ana', password: '1234' }).subscribe();
      httpMock.expectOne(`${API}/auth/login`).flush({ access_token: 'tok', user: mockUser });
      expect(localStorage.getItem(TOKEN_KEY)).toBe('tok');
    });

    it('guarda el usuario en localStorage tras login exitoso', () => {
      service.login({ username: 'ana', password: '1234' }).subscribe();
      httpMock.expectOne(`${API}/auth/login`).flush({ access_token: 'tok', user: mockUser });
      expect(JSON.parse(localStorage.getItem(USER_KEY)!)).toEqual(mockUser);
    });

    it('actualiza isAuthenticated a true tras login exitoso', () => {
      service.login({ username: 'ana', password: '1234' }).subscribe();
      httpMock.expectOne(`${API}/auth/login`).flush({ access_token: 'tok', user: mockUser });
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('actualiza currentUser con los datos del usuario', () => {
      service.login({ username: 'ana', password: '1234' }).subscribe();
      httpMock.expectOne(`${API}/auth/login`).flush({ access_token: 'tok', user: mockUser });
      expect(service.currentUser()).toEqual(mockUser);
    });

    it('inicia las notificaciones tras login exitoso', () => {
      service.login({ username: 'ana', password: '1234' }).subscribe();
      httpMock.expectOne(`${API}/auth/login`).flush({ access_token: 'tok', user: mockUser });
      expect(notifSvc.cargar).toHaveBeenCalled();
      expect(notifSvc.iniciarPolling).toHaveBeenCalled();
    });

    it('maneja respuesta envuelta en { data: {...} }', () => {
      service.login({ username: 'ana', password: '1234' }).subscribe();
      httpMock
        .expectOne(`${API}/auth/login`)
        .flush({ data: { access_token: 'tok', user: mockUser } });
      expect(localStorage.getItem(TOKEN_KEY)).toBe('tok');
    });
  });

  // ── logout() ─────────────────────────────────────────────────────

  describe('logout()', () => {
    beforeEach(() => {
      localStorage.setItem(TOKEN_KEY, 'fake-jwt-token');
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
    });

    it('elimina el token de localStorage', () => {
      service.logout();
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });

    it('elimina el usuario de localStorage', () => {
      service.logout();
      expect(localStorage.getItem(USER_KEY)).toBeNull();
    });

    it('navega a /login', () => {
      spyOn(router, 'navigate');
      service.logout();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  // ── verifyToken() / getProfile() ─────────────────────────────────

  describe('verifyToken()', () => {
    it('hace GET a /auth/verify', () => {
      service.verifyToken().subscribe();
      const req = httpMock.expectOne(`${API}/auth/verify`);
      expect(req.request.method).toBe('GET');
      req.flush({ valid: true, user: mockUser });
    });
  });

  describe('getProfile()', () => {
    it('hace GET a /auth/profile', () => {
      service.getProfile().subscribe();
      const req = httpMock.expectOne(`${API}/auth/profile`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  // ── forgotPassword() / resetPassword() / changePassword() ────────

  describe('forgotPassword()', () => {
    it('hace POST a /auth/forgot-password con el email', () => {
      service.forgotPassword('ana@gabinete.es').subscribe();
      const req = httpMock.expectOne(`${API}/auth/forgot-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'ana@gabinete.es' });
      req.flush({ message: 'ok' });
    });
  });

  describe('resetPassword()', () => {
    it('hace POST a /auth/reset-password con token y nueva contraseña', () => {
      service.resetPassword('reset-tok', 'nueva1234').subscribe();
      const req = httpMock.expectOne(`${API}/auth/reset-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ token: 'reset-tok', newPassword: 'nueva1234' });
      req.flush({ message: 'ok' });
    });
  });

  describe('changePassword()', () => {
    it('hace POST a /auth/change-password', () => {
      service.changePassword('antigua', 'nueva').subscribe();
      const req = httpMock.expectOne(`${API}/auth/change-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ oldPassword: 'antigua', newPassword: 'nueva' });
      req.flush({ message: 'ok' });
    });
  });
});
