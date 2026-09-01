import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError, Subject, BehaviorSubject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ListadoComponent } from './listado.component';
import { ClientesService } from '../../../services/cliente.service';

// ─── Mock helpers ─────────────────────────────────────────────────────────────

const mockClienteData = () => ({
  nombre: 'Ana',
  apellidos: 'García',
  edad: 10,
  edadTexto: '10 años',
  fechaNacimiento: new Date('2015-06-15'),
  domicilio: 'Calle Mayor 1',
  curso: '3º Primaria',
  dni: '12345678A',
  ciudad: 'Madrid',
  provincia: 'Madrid',
  fechaAlta: new Date('2024-01-01'),
  fechaInicio: new Date('2024-01-10'),
  objetivosResumen: { total: 0, activos: 0 },
});

const makeClientesSvcMock = () => ({
  cliente: signal<any>(null),
  clienteRaw: signal<any>(null),
  sanitario: signal<any>(null),
  loadAll: jasmine.createSpy('loadAll').and.returnValue(of(undefined)),
  clearCliente: jasmine.createSpy('clearCliente'),
});

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('ListadoComponent', () => {
  let component: ListadoComponent;
  let fixture: ComponentFixture<ListadoComponent>;
  let clientesSvc: ReturnType<typeof makeClientesSvcMock>;
  let paramMapSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    clientesSvc = makeClientesSvcMock();
    paramMapSubject = new BehaviorSubject(convertToParamMap({ id: 'cliente-1' }));

    await TestBed.configureTestingModule({
      imports: [ListadoComponent],
      providers: [
        { provide: ClientesService, useValue: clientesSvc },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: paramMapSubject.asObservable() },
        },
      ],
    })
      .overrideComponent(ListadoComponent, { set: { schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();

    fixture = TestBed.createComponent(ListadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Inicialización ───────────────────────────────────────────────────────
  describe('ngOnInit() / getDetalleCliente()', () => {
    it('llama a clientesSvc.loadAll con el id de la ruta', () => {
      expect(clientesSvc.loadAll).toHaveBeenCalledWith('cliente-1');
    });

    it('establece clienteId a partir del parámetro de ruta', () => {
      expect(component.clienteId()).toBe('cliente-1');
    });

    it('isLoading es false después de cargar', () => {
      expect(component.isLoading()).toBe(false);
    });

    it('error es null cuando la carga es exitosa', () => {
      expect(component.error()).toBeNull();
    });
  });

  // ── Computed: fullName e initials ────────────────────────────────────────
  describe('computed signals', () => {
    beforeEach(() => {
      clientesSvc.cliente.set(mockClienteData());
      fixture.detectChanges();
    });

    it('fullName devuelve "Apellidos, Nombre"', () => {
      expect(component.fullName()).toBe('García, Ana');
    });

    it('initials devuelve las iniciales del cliente', () => {
      expect(component.initials()).toBe('AG');
    });

    it('fullName devuelve solo nombre si no hay apellidos', () => {
      clientesSvc.cliente.set({ ...mockClienteData(), apellidos: '' });
      expect(component.fullName()).toBe('Ana');
    });

    it('fullName devuelve cadena vacía si no hay cliente', () => {
      clientesSvc.cliente.set(null);
      expect(component.fullName()).toBe('');
    });
  });

  // ── Pestañas de la ficha ─────────────────────────────────────────────────
  describe('tabs', () => {
    it('empieza por Perfil y termina en Terapeutas', () => {
      const targets = component.tabs().map(t => t.target);
      expect(targets[0]).toBe('perfil');
      expect(targets.at(-1)).toBe('terapeutas');
    });

    it('lo del día a día va antes que la configuración del caso', () => {
      const targets = component.tabs().map(t => t.target);
      expect(targets.indexOf('sesiones')).toBeLessThan(targets.indexOf('contratos'));
      expect(targets.indexOf('documentacion')).toBeLessThan(targets.indexOf('terapeutas'));
    });

    it('una sola lista: no quedan grupos separados', () => {
      expect((component as any).workTabs).toBeUndefined();
      expect((component as any).configTabs).toBeUndefined();
    });
  });

  // ── Manejo de errores ────────────────────────────────────────────────────
  describe('manejo de errores', () => {
    it('establece error cuando loadAll falla', fakeAsync(() => {
      clientesSvc.loadAll.and.returnValue(throwError(() => new Error('Error de red')));

      paramMapSubject.next(convertToParamMap({ id: 'cliente-error' }));
      tick();

      expect(component.error()).toBe('Error de red');
      expect(component.isLoading()).toBe(false);
    }));

    it('establece mensaje por defecto cuando el error no tiene mensaje', fakeAsync(() => {
      clientesSvc.loadAll.and.returnValue(throwError(() => ({})));

      paramMapSubject.next(convertToParamMap({ id: 'cliente-error' }));
      tick();

      expect(component.error()).toBe('Error al cargar el cliente.');
    }));

    it('establece error si no hay id en la URL', fakeAsync(() => {
      paramMapSubject.next(convertToParamMap({}));
      tick();

      expect(component.error()).toBe('ID de cliente no proporcionado en la URL.');
    }));
  });

  // ── Recarga cuando cambia el parámetro de ruta ───────────────────────────
  describe('reactividad al cambio de ruta', () => {
    it('vuelve a llamar loadAll cuando el id de la ruta cambia', fakeAsync(() => {
      paramMapSubject.next(convertToParamMap({ id: 'cliente-2' }));
      tick();

      expect(clientesSvc.loadAll).toHaveBeenCalledWith('cliente-2');
      expect(component.clienteId()).toBe('cliente-2');
    }));
  });

  // ── Destrucción ──────────────────────────────────────────────────────────
  describe('ngOnDestroy()', () => {
    it('completa la suscripción sin errores', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});
