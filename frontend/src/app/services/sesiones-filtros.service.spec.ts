import { TestBed } from '@angular/core/testing';
import { SesionesFiltrosService } from './sesiones-filtros.service';

describe('SesionesFiltrosService', () => {
  let service: SesionesFiltrosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SesionesFiltrosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Estado inicial ──────────────────────────────────────────────

  describe('estado inicial', () => {
    it('filtroEstado empieza en TODAS', () => {
      expect(service.filtroEstado()).toBe('TODAS');
    });

    it('filtroMes empieza vacío', () => {
      expect(service.filtroMes()).toBe('');
    });
  });

  // ── inicializar() ───────────────────────────────────────────────

  describe('inicializar()', () => {
    it('resetea los filtros la primera vez que se llama con un clienteId nuevo', () => {
      service.filtroEstado.set('COMPLETADA');
      service.filtroMes.set('2026-03');

      service.inicializar('cliente-1');

      expect(service.filtroEstado()).toBe('TODAS');
      expect(service.filtroMes()).toBe('');
    });

    it('NO resetea los filtros cuando se llama con el mismo clienteId', () => {
      service.inicializar('cliente-1');
      service.filtroEstado.set('COMPLETADA');
      service.filtroMes.set('2026-03');

      service.inicializar('cliente-1'); // mismo id

      expect(service.filtroEstado()).toBe('COMPLETADA');
      expect(service.filtroMes()).toBe('2026-03');
    });

    it('resetea los filtros al cambiar de cliente', () => {
      service.inicializar('cliente-1');
      service.filtroEstado.set('CANCELADA_CON_AVISO');
      service.filtroMes.set('2026-01');

      service.inicializar('cliente-2');

      expect(service.filtroEstado()).toBe('TODAS');
      expect(service.filtroMes()).toBe('');
    });

    it('resetea de nuevo si se alterna entre dos clientes distintos', () => {
      service.inicializar('cliente-1');
      service.filtroEstado.set('COMPLETADA');

      service.inicializar('cliente-2'); // cambia
      service.filtroEstado.set('PROGRAMADA');

      service.inicializar('cliente-1'); // vuelve al primero
      expect(service.filtroEstado()).toBe('TODAS');
    });
  });

  // ── resetear() ──────────────────────────────────────────────────

  describe('resetear()', () => {
    it('resetea filtroEstado a TODAS', () => {
      service.filtroEstado.set('CANCELADA_SIN_AVISO');
      service.resetear();
      expect(service.filtroEstado()).toBe('TODAS');
    });

    it('resetea filtroMes a vacío', () => {
      service.filtroMes.set('2026-02');
      service.resetear();
      expect(service.filtroMes()).toBe('');
    });

    it('funciona aunque ya estuviera en los valores por defecto', () => {
      service.resetear();
      expect(service.filtroEstado()).toBe('TODAS');
      expect(service.filtroMes()).toBe('');
    });
  });
});
