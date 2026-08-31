import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { BonosService } from './bonos.service';
import { Bono, CreateBonoDto, getBonoProgreso } from '../interface/bono.interface';
import { environment } from '../../environments/environment.development';

const API = `${environment.apiUrl}/bonos`;

function makeBono(overrides: Partial<Bono> = {}): Bono {
  return {
    id: 'bono-1',
    clienteId: 'cliente-1',
    tipoSesion: 'PEDAGOGIA',
    totalSesiones: 10,
    sesionesConsumidas: 3,
    precio: 200,
    estado: 'ACTIVO',
    pagado: true,
    fechaInicio: '2026-01-01',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('BonosService', () => {
  let service: BonosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BonosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Computed signals ────────────────────────────────────────────

  describe('computed signals (sin HTTP)', () => {
    it('bonoActivo devuelve null cuando la lista está vacía', () => {
      expect(service.bonoActivo()).toBeNull();
    });

    it('tieneBonoPendientePago devuelve false cuando la lista está vacía', () => {
      expect(service.tieneBonoPendientePago()).toBeFalse();
    });
  });

  describe('computed signals (con datos)', () => {
    beforeEach(() => {
      const bonos: Bono[] = [
        makeBono({ id: 'b1', estado: 'ACTIVO', pagado: true }),
        makeBono({ id: 'b2', estado: 'CONSUMIDO', pagado: false }),
        makeBono({ id: 'b3', estado: 'CANCELADO', pagado: true }),
      ];
      service.loadBonosCliente('cliente-1').subscribe();
      httpMock.expectOne(`${API}/cliente/cliente-1`).flush({ data: bonos });
    });

    it('bonoActivo devuelve el bono con estado ACTIVO', () => {
      expect(service.bonoActivo()?.id).toBe('b1');
    });

    it('historialBonos devuelve los bonos no ACTIVO', () => {
      const historial = service.historialBonos();
      expect(historial.length).toBe(2);
      expect(historial.some((b) => b.id === 'b2')).toBeTrue();
      expect(historial.some((b) => b.id === 'b3')).toBeTrue();
    });

    it('historialBonos NO incluye el bono ACTIVO', () => {
      expect(service.historialBonos().some((b) => b.id === 'b1')).toBeFalse();
    });

    it('tieneBonoPendientePago es true cuando hay CONSUMIDO no pagado', () => {
      expect(service.tieneBonoPendientePago()).toBeTrue();
    });
  });

  describe('tieneBonoPendientePago — casos de pago', () => {
    it('es false cuando todos los CONSUMIDO están pagados', () => {
      service.loadBonosCliente('cliente-1').subscribe();
      httpMock
        .expectOne(`${API}/cliente/cliente-1`)
        .flush({ data: [makeBono({ estado: 'CONSUMIDO', pagado: true })] });
      expect(service.tieneBonoPendientePago()).toBeFalse();
    });

    it('es false cuando no hay ningún CONSUMIDO', () => {
      service.loadBonosCliente('cliente-1').subscribe();
      httpMock
        .expectOne(`${API}/cliente/cliente-1`)
        .flush({ data: [makeBono({ estado: 'ACTIVO', pagado: false })] });
      expect(service.tieneBonoPendientePago()).toBeFalse();
    });
  });

  // ── loadBonosCliente() ──────────────────────────────────────────

  describe('loadBonosCliente()', () => {
    it('hace GET a /bonos/cliente/:id', () => {
      service.loadBonosCliente('cliente-42').subscribe();
      const req = httpMock.expectOne(`${API}/cliente/cliente-42`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [] });
    });

    it('establece el signal bonosCliente con los datos recibidos', () => {
      const bonos = [makeBono({ id: 'b1' }), makeBono({ id: 'b2' })];
      service.loadBonosCliente('cliente-1').subscribe();
      httpMock.expectOne(`${API}/cliente/cliente-1`).flush({ data: bonos });
      expect(service.bonosCliente()).toEqual(bonos);
    });
  });

  // ── createBono() ────────────────────────────────────────────────

  describe('createBono()', () => {
    it('hace POST a /bonos', () => {
      const dto: CreateBonoDto = { clienteId: 'cliente-1', tipoSesion: 'PEDAGOGIA' as const, totalSesiones: 10, precio: 300 };
      service.createBono(dto).subscribe();
      const req = httpMock.expectOne(API);
      expect(req.request.method).toBe('POST');
      req.flush({ data: makeBono() });
    });

    it('añade el nuevo bono al principio de la lista (prepend)', () => {
      const existing = makeBono({ id: 'b-old' });
      service.loadBonosCliente('cliente-1').subscribe();
      httpMock.expectOne(`${API}/cliente/cliente-1`).flush({ data: [existing] });

      const nuevo = makeBono({ id: 'b-new' });
      service.createBono({ clienteId: 'cliente-1', tipoSesion: 'PEDAGOGIA' as const, totalSesiones: 10, precio: 300 }).subscribe();
      httpMock.expectOne(API).flush({ data: nuevo });

      const bonos = service.bonosCliente();
      expect(bonos[0].id).toBe('b-new');
      expect(bonos[1].id).toBe('b-old');
    });
  });

  // ── registrarPago() ─────────────────────────────────────────────

  describe('registrarPago()', () => {
    it('hace PATCH a /bonos/:id/registrar-pago', () => {
      const bono = makeBono({ id: 'bono-1', pagado: false });
      service.loadBonosCliente('cliente-1').subscribe();
      httpMock.expectOne(`${API}/cliente/cliente-1`).flush({ data: [bono] });

      service.registrarPago('bono-1', { metodoPago: 'EFECTIVO' }).subscribe();
      const req = httpMock.expectOne(`${API}/bono-1/registrar-pago`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ data: makeBono({ id: 'bono-1', pagado: true }) });

      expect(service.bonosCliente()[0].pagado).toBeTrue();
    });
  });

  // ── cancelarBono() ──────────────────────────────────────────────

  describe('cancelarBono()', () => {
    it('hace PATCH a /bonos/:id/cancelar y actualiza el bono en la lista', () => {
      const bono = makeBono({ id: 'bono-1', estado: 'ACTIVO' });
      service.loadBonosCliente('cliente-1').subscribe();
      httpMock.expectOne(`${API}/cliente/cliente-1`).flush({ data: [bono] });

      service.cancelarBono('bono-1').subscribe();
      const req = httpMock.expectOne(`${API}/bono-1/cancelar`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ data: makeBono({ id: 'bono-1', estado: 'CANCELADO' }) });

      expect(service.bonosCliente()[0].estado).toBe('CANCELADO');
    });

    it('no modifica otros bonos al cancelar uno', () => {
      const bonos = [
        makeBono({ id: 'b1', estado: 'ACTIVO' }),
        makeBono({ id: 'b2', estado: 'CONSUMIDO' }),
      ];
      service.loadBonosCliente('cliente-1').subscribe();
      httpMock.expectOne(`${API}/cliente/cliente-1`).flush({ data: bonos });

      service.cancelarBono('b1').subscribe();
      httpMock
        .expectOne(`${API}/b1/cancelar`)
        .flush({ data: makeBono({ id: 'b1', estado: 'CANCELADO' }) });

      expect(service.bonosCliente()[1].estado).toBe('CONSUMIDO');
    });
  });

  // ── getCobrosPendientes() ───────────────────────────────────────

  describe('getCobrosPendientes()', () => {
    it('hace GET a /bonos/cobros-pendientes', () => {
      service.getCobrosPendientes().subscribe();
      const req = httpMock.expectOne(`${API}/cobros-pendientes`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [] });
    });
  });
});

// ── getBonoProgreso() — función pura ────────────────────────────────

describe('getBonoProgreso()', () => {
  it('devuelve 0% cuando no hay sesiones consumidas', () => {
    const bono = makeBono({ totalSesiones: 10, sesionesConsumidas: 0 });
    expect(getBonoProgreso(bono).porcentaje).toBe(0);
  });

  it('devuelve 100% cuando todas las sesiones están consumidas', () => {
    const bono = makeBono({ totalSesiones: 10, sesionesConsumidas: 10 });
    expect(getBonoProgreso(bono).porcentaje).toBe(100);
  });

  it('devuelve 30% cuando se han consumido 3 de 10', () => {
    const bono = makeBono({ totalSesiones: 10, sesionesConsumidas: 3 });
    expect(getBonoProgreso(bono).porcentaje).toBe(30);
  });

  it('devuelve color verde cuando queda más del 50%', () => {
    const bono = makeBono({ totalSesiones: 10, sesionesConsumidas: 2 }); // 20% consumido → 80% restante
    expect(getBonoProgreso(bono).color).toBe('#2f6b43');
  });

  it('devuelve color amarillo cuando queda entre 25% y 50%', () => {
    const bono = makeBono({ totalSesiones: 10, sesionesConsumidas: 6 }); // 60% consumido → 40% restante
    expect(getBonoProgreso(bono).color).toBe('#8a6018');
  });

  it('devuelve color rojo cuando queda 25% o menos', () => {
    const bono = makeBono({ totalSesiones: 10, sesionesConsumidas: 8 }); // 80% consumido → 20% restante
    expect(getBonoProgreso(bono).color).toBe('#96382e');
  });
});
