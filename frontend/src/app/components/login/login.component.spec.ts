import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { LoginComponent } from './login.component';
import { NotificacionesService } from '../../services/notificaciones.service';
import { of } from 'rxjs';

const API_LOGIN = 'http://localhost:3000/api/auth/login';

const mockUser = {
  id: 'u1',
  username: 'ana',
  nombre: 'Ana',
  apellidos: 'García',
  email: 'ana@g.es',
  rol: { id: 'r1', nombre: 'Terapeuta', codigo: 'T' },
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let httpMock: HttpTestingController;
  let router: Router;
  let notifSvc: NotificacionesService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    notifSvc = TestBed.inject(NotificacionesService);

    // Evitar peticiones reales de notificaciones en los tests de login
    spyOn(notifSvc, 'cargar').and.returnValue(of([]));
    spyOn(notifSvc, 'conectarSSE');
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  // ── Señales iniciales ───────────────────────────────────────────

  describe('señales iniciales', () => {
    it('loading empieza en false', () => {
      expect(component.loading()).toBeFalse();
    });

    it('serverError empieza en null', () => {
      expect(component.serverError()).toBeNull();
    });

    it('hidePwd empieza en true (contraseña oculta)', () => {
      expect(component.hidePwd()).toBeTrue();
    });
  });

  // ── Validación del formulario ───────────────────────────────────

  describe('formulario', () => {
    it('empieza inválido (campos vacíos)', () => {
      expect(component.form.invalid).toBeTrue();
    });

    it('username es obligatorio', () => {
      const ctrl = component.form.get('username')!;
      ctrl.setValue('');
      expect(ctrl.hasError('required')).toBeTrue();
    });

    it('password es obligatorio', () => {
      const ctrl = component.form.get('password')!;
      ctrl.setValue('');
      expect(ctrl.hasError('required')).toBeTrue();
    });

    it('username necesita mínimo 3 caracteres', () => {
      component.form.get('username')!.setValue('ab');
      expect(component.form.get('username')!.hasError('minlength')).toBeTrue();
    });

    it('password necesita mínimo 6 caracteres', () => {
      component.form.get('password')!.setValue('12345');
      expect(component.form.get('password')!.hasError('minlength')).toBeTrue();
    });

    it('es válido con datos correctos', () => {
      component.form.setValue({ username: 'usuario', password: 'contraseña123' });
      expect(component.form.valid).toBeTrue();
    });
  });

  // ── onSubmit() con formulario inválido ──────────────────────────

  describe('onSubmit() — formulario inválido', () => {
    it('marca todos los campos como touched', () => {
      component.onSubmit();
      expect(component.form.get('username')!.touched).toBeTrue();
      expect(component.form.get('password')!.touched).toBeTrue();
    });

    it('no llama a la API', () => {
      component.onSubmit();
      httpMock.expectNone(API_LOGIN);
    });

    it('no modifica el signal loading', () => {
      component.onSubmit();
      expect(component.loading()).toBeFalse();
    });
  });

  // ── onSubmit() exitoso ──────────────────────────────────────────

  describe('onSubmit() — login exitoso', () => {
    beforeEach(() => {
      component.form.setValue({ username: 'ana', password: 'password123' });
    });

    it('pone loading en true mientras espera respuesta', () => {
      component.onSubmit();
      expect(component.loading()).toBeTrue();
      httpMock.expectOne(API_LOGIN).flush({ access_token: 'tok', user: mockUser });
    });

    it('pone loading en false tras respuesta exitosa', () => {
      component.onSubmit();
      httpMock.expectOne(API_LOGIN).flush({ access_token: 'tok', user: mockUser });
      expect(component.loading()).toBeFalse();
    });

    it('navega a /home después del delay (100ms)', fakeAsync(() => {
      spyOn(router, 'navigate');
      component.onSubmit();
      httpMock.expectOne(API_LOGIN).flush({ access_token: 'tok', user: mockUser });
      expect(router.navigate).not.toHaveBeenCalled(); // aún no (setTimeout)
      tick(100);
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    }));

    it('limpia serverError tras login exitoso', () => {
      component.serverError.set('Error previo');
      component.onSubmit();
      httpMock.expectOne(API_LOGIN).flush({ access_token: 'tok', user: mockUser });
      expect(component.serverError()).toBeNull();
    });
  });

  // ── onSubmit() con errores del servidor ────────────────────────

  describe('onSubmit() — errores del servidor', () => {
    beforeEach(() => {
      component.form.setValue({ username: 'ana', password: 'password123' });
    });

    it('muestra "Usuario o contraseña incorrectos" para error 401', () => {
      component.onSubmit();
      httpMock
        .expectOne(API_LOGIN)
        .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      expect(component.serverError()).toBe('Usuario o contraseña incorrectos');
    });

    it('muestra error de conexión para status 0 (red)', () => {
      component.onSubmit();
      httpMock.expectOne(API_LOGIN).error(new ProgressEvent('error'));
      expect(component.serverError()).toBe('No se pudo conectar con el servidor');
    });

    it('muestra mensaje genérico para otros errores', () => {
      component.onSubmit();
      httpMock
        .expectOne(API_LOGIN)
        .flush('Internal Error', { status: 500, statusText: 'Server Error' });
      expect(component.serverError()).toBe('Error al iniciar sesión. Inténtalo de nuevo.');
    });

    it('pone loading en false después de cualquier error', () => {
      component.onSubmit();
      httpMock
        .expectOne(API_LOGIN)
        .flush('Error', { status: 500, statusText: 'Server Error' });
      expect(component.loading()).toBeFalse();
    });
  });
});
