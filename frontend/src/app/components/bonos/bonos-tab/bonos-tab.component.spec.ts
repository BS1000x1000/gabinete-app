import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import BonosTabComponent from './bonos-tab.component';
import { BonosService } from '../../../services/bonos.service';
import { ClientesService } from '../../../services/cliente.service';
import { Bono } from '../../../interface/bono.interface';

function makeBono(overrides: Partial<Bono> = {}): Bono {
  return {
    id: 'bono-1',
    clienteId: 'cliente-1',
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

const mockActivatedRoute = {
  parent: {
    snapshot: { paramMap: { get: (_: string) => 'cliente-test-id' } },
  },
};

describe('BonosTabComponent', () => {
  let component: BonosTabComponent;
  let bonosServiceSpy: jasmine.SpyObj<BonosService>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    bonosServiceSpy = jasmine.createSpyObj(
      'BonosService',
      ['loadBonosCliente', 'createBono', 'registrarPago', 'cancelarBono'],
      {
        // Propiedades computed del servicio (readonly signals)
        bonoActivo: jasmine.createSpy('bonoActivo').and.returnValue(null),
        historialBonos: jasmine.createSpy('historialBonos').and.returnValue([]),
        bonosCliente: jasmine.createSpy('bonosCliente').and.returnValue([]),
      },
    );
    bonosServiceSpy.loadBonosCliente.and.returnValue(of([]));

    const clientesServiceSpy = jasmine.createSpyObj('ClientesService', [], {
      contactosFamiliares: jasmine.createSpy('contactosFamiliares').and.returnValue([]),
    });

    await TestBed.configureTestingModule({
      imports: [BonosTabComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: BonosService, useValue: bonosServiceSpy },
        { provide: ClientesService, useValue: clientesServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(BonosTabComponent, {
        set: { imports: [CommonModule] },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(BonosTabComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  // ── Estado inicial de modales ────────────────────────────────────

  describe('estado inicial de modales', () => {
    it('showCreateModal empieza en false', () => {
      expect(component.showCreateModal()).toBeFalse();
    });

    it('showPagoModal empieza en false', () => {
      expect(component.showPagoModal()).toBeFalse();
    });

    it('showHistorialModal empieza en false', () => {
      expect(component.showHistorialModal()).toBeFalse();
    });

    it('bonoParaPago empieza en null', () => {
      expect(component.bonoParaPago()).toBeNull();
    });
  });

  // ── ngOnInit ────────────────────────────────────────────────────

  describe('ngOnInit()', () => {
    it('lee el clienteId desde la ruta padre', () => {
      component.ngOnInit();
      expect(component.clienteId).toBe('cliente-test-id');
    });

    it('llama a loadBonosCliente con el clienteId correcto', () => {
      component.ngOnInit();
      expect(bonosServiceSpy.loadBonosCliente).toHaveBeenCalledWith('cliente-test-id');
    });

    it('pone isLoading en false cuando la carga completa', () => {
      bonosServiceSpy.loadBonosCliente.and.returnValue(of([]));
      component.ngOnInit();
      expect(component.isLoading()).toBeFalse();
    });
  });

  // ── openPagoModal() ─────────────────────────────────────────────

  describe('openPagoModal()', () => {
    it('establece bonoParaPago con el bono dado', () => {
      const bono = makeBono({ id: 'bono-pago' });
      component.openPagoModal(bono);
      expect(component.bonoParaPago()?.id).toBe('bono-pago');
    });

    it('abre el modal de pago', () => {
      component.openPagoModal(makeBono());
      expect(component.showPagoModal()).toBeTrue();
    });
  });

  // ── onBonoCreado() ──────────────────────────────────────────────

  describe('onBonoCreado()', () => {
    it('cierra el modal de creación', () => {
      component.showCreateModal.set(true);
      component.onBonoCreado();
      expect(component.showCreateModal()).toBeFalse();
    });
  });

  // ── onPagoRegistrado() ──────────────────────────────────────────

  describe('onPagoRegistrado()', () => {
    it('cierra el modal de pago', () => {
      component.showPagoModal.set(true);
      component.onPagoRegistrado();
      expect(component.showPagoModal()).toBeFalse();
    });

    it('limpia bonoParaPago', () => {
      component.bonoParaPago.set(makeBono());
      component.onPagoRegistrado();
      expect(component.bonoParaPago()).toBeNull();
    });
  });

  // ── Helpers expuestos en el template ────────────────────────────

  describe('helpers expuestos', () => {
    it('estadoConfig está definido', () => {
      expect(component.estadoConfig).toBeDefined();
      expect(component.estadoConfig['ACTIVO']).toBeDefined();
    });

    it('metodoPagoLabels está definido', () => {
      expect(component.metodoPagoLabels).toBeDefined();
      expect(component.metodoPagoLabels['EFECTIVO']).toBeDefined();
    });

    it('getProgreso es la función getBonoProgreso', () => {
      expect(typeof component.getProgreso).toBe('function');
      const bono = makeBono({ totalSesiones: 10, sesionesConsumidas: 5 });
      const result = component.getProgreso(bono);
      expect(result.porcentaje).toBe(50);
    });
  });
});
