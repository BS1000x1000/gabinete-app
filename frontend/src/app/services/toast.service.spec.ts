import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Estado inicial ──────────────────────────────────────────────

  describe('estado inicial', () => {
    it('toasts empieza vacío', () => {
      expect(service.toasts()).toEqual([]);
    });
  });

  // ── Métodos de creación ─────────────────────────────────────────

  describe('success()', () => {
    it('añade un toast con type success y el mensaje correcto', () => {
      service.success('Guardado correctamente');
      expect(service.toasts().length).toBe(1);
      expect(service.toasts()[0].type).toBe('success');
      expect(service.toasts()[0].message).toBe('Guardado correctamente');
    });
  });

  describe('error()', () => {
    it('añade un toast con type error', () => {
      service.error('Ha ocurrido un error');
      expect(service.toasts()[0].type).toBe('error');
      expect(service.toasts()[0].message).toBe('Ha ocurrido un error');
    });
  });

  describe('warning()', () => {
    it('añade un toast con type warning', () => {
      service.warning('Advertencia importante');
      expect(service.toasts()[0].type).toBe('warning');
    });
  });

  describe('info()', () => {
    it('añade un toast con type info', () => {
      service.info('Información de sistema');
      expect(service.toasts()[0].type).toBe('info');
    });
  });

  // ── Gestión de IDs ──────────────────────────────────────────────

  describe('IDs', () => {
    it('cada toast tiene un ID único', () => {
      service.success('uno');
      service.success('dos');
      service.success('tres');
      const ids = service.toasts().map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });

    it('los IDs son incremetales', () => {
      service.success('uno');
      service.error('dos');
      const [id1, id2] = service.toasts().map((t) => t.id);
      expect(id2).toBeGreaterThan(id1);
    });
  });

  // ── Propiedad duration ──────────────────────────────────────────

  describe('duration', () => {
    it('usa 4000ms por defecto', () => {
      service.success('mensaje');
      expect(service.toasts()[0].duration).toBe(4000);
    });

    it('respeta una duración personalizada', () => {
      service.success('mensaje', 1500);
      expect(service.toasts()[0].duration).toBe(1500);
    });
  });

  // ── remove() ────────────────────────────────────────────────────

  describe('remove()', () => {
    it('elimina el toast con el ID dado', () => {
      service.success('eliminar');
      const id = service.toasts()[0].id;
      service.remove(id);
      expect(service.toasts()).toEqual([]);
    });

    it('no elimina otros toasts al eliminar uno', () => {
      service.success('uno');
      service.success('dos');
      const id = service.toasts()[0].id;
      service.remove(id);
      expect(service.toasts().length).toBe(1);
      expect(service.toasts()[0].message).toBe('dos');
    });

    it('es idempotente: eliminar el mismo ID dos veces no falla', () => {
      service.success('toast');
      const id = service.toasts()[0].id;
      service.remove(id);
      service.remove(id); // segunda vez → sin efecto
      expect(service.toasts()).toEqual([]);
    });
  });

  // ── Auto-eliminación ────────────────────────────────────────────

  describe('auto-eliminación con fakeAsync', () => {
    it('se elimina automáticamente después de la duración por defecto (4000ms)', fakeAsync(() => {
      service.success('temporal');
      expect(service.toasts().length).toBe(1);
      tick(4000);
      expect(service.toasts().length).toBe(0);
    }));

    it('no se elimina antes de que expire su duración', fakeAsync(() => {
      service.success('mensaje', 2000);
      tick(1999);
      expect(service.toasts().length).toBe(1);
      tick(1);
      expect(service.toasts().length).toBe(0);
    }));

    it('múltiples toasts se eliminan en su propia duración', fakeAsync(() => {
      service.success('corto', 1000);
      service.success('largo', 3000);

      tick(1000);
      expect(service.toasts().length).toBe(1);
      expect(service.toasts()[0].message).toBe('largo');

      tick(2000);
      expect(service.toasts().length).toBe(0);
    }));

    it('eliminar manualmente antes del timeout no genera error', fakeAsync(() => {
      service.success('manual', 2000);
      const id = service.toasts()[0].id;
      service.remove(id); // eliminado antes del timeout

      tick(2000); // el setTimeout se dispara pero no hace nada
      expect(service.toasts().length).toBe(0);
    }));
  });
});
