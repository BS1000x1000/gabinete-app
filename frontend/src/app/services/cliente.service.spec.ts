import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ClientesService } from './cliente.service';
import { environment } from '../../environments/environment.development';

const API = `${environment.apiUrl}/clientes`;

const wrap = <T>(data: T) => ({ success: true, data, timestamp: new Date().toISOString() });

const mockClienteBackend = (overrides: Record<string, any> = {}) => ({
  id: 'cliente-1',
  nombre: 'Ana',
  apellidos: 'García',
  dni: '12345678A',
  domicilio: 'Calle Mayor 1',
  provincia: 'Madrid',
  ciudad: 'Madrid',
  curso: '3º Primaria',
  activo: true,
  fechaNacimiento: '2015-06-15T00:00:00.000Z',
  fechaAlta: '2024-01-01T00:00:00.000Z',
  fechaInicio: '2024-01-10T00:00:00.000Z',
  contactosFamiliares: [],
  colegio: null,
  sanitario: null,
  objetivosGeneralesAsignados: [],
  ...overrides,
});

describe('ClientesService', () => {
  let service: ClientesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ClientesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── create ────────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('hace POST a /clientes', () => {
      const dto = { nombre: 'Pedro', apellidos: 'López', dni: '11111111C' };
      service.create(dto).subscribe((res) => expect(res.nombre).toBe('Pedro'));

      const req = httpMock.expectOne(API);
      expect(req.request.method).toBe('POST');
      req.flush(wrap(mockClienteBackend({ nombre: 'Pedro', apellidos: 'López', dni: '11111111C' })));
    });
  });

  // ── updateCliente ─────────────────────────────────────────────────────────
  describe('updateCliente()', () => {
    it('hace PATCH a /clientes/:id', () => {
      service.updateCliente('cliente-1', { nombre: 'Ana M.' }).subscribe();

      const req = httpMock.expectOne(`${API}/cliente-1`);
      expect(req.request.method).toBe('PATCH');
      req.flush(wrap(mockClienteBackend({ nombre: 'Ana M.' })));
    });
  });

  // ── getAll ────────────────────────────────────────────────────────────────
  describe('getAll()', () => {
    /**
     * El endpoint esta paginado desde que se anadio `PaginationDto` (por defecto
     * 100, tope 500), asi que `getAll()` pide explicitamente `?limit=500`. El
     * spec seguia esperando la URL desnuda y llevaba en rojo desde entonces.
     */
    it('hace GET a /clientes pidiendo el tope de paginación', () => {
      const lista = [mockClienteBackend(), mockClienteBackend({ id: 'cliente-2', dni: '87654321B' })];
      service.getAll().subscribe((res) => expect(res).toHaveSize(2));

      const req = httpMock.expectOne(`${API}?limit=500`);
      expect(req.request.method).toBe('GET');
      req.flush(wrap(lista));
    });
  });

  // ── getMisClientes ────────────────────────────────────────────────────────
  describe('getMisClientes()', () => {
    it('hace GET a /clientes/mis-clientes', () => {
      service.getMisClientes().subscribe();

      const req = httpMock.expectOne(`${API}/mis-clientes`);
      expect(req.request.method).toBe('GET');
      req.flush(wrap([]));
    });
  });

  // ── getById ───────────────────────────────────────────────────────────────
  describe('getById()', () => {
    it('hace GET a /clientes/:id', () => {
      const data = mockClienteBackend();
      service.getById('cliente-1').subscribe((res) => expect(res.id).toBe('cliente-1'));

      const req = httpMock.expectOne(`${API}/cliente-1`);
      expect(req.request.method).toBe('GET');
      req.flush(wrap(data));
    });
  });

  // ── loadAll ───────────────────────────────────────────────────────────────
  describe('loadAll()', () => {
    it('hace GET a /clientes/:id y actualiza el signal cliente', () => {
      service.loadAll('cliente-1').subscribe();

      const req = httpMock.expectOne(`${API}/cliente-1`);
      req.flush(wrap(mockClienteBackend()));

      expect(service.cliente()).not.toBeNull();
      expect(service.cliente()?.nombre).toBe('Ana');
    });

    it('actualiza signal clienteRaw', () => {
      service.loadAll('cliente-1').subscribe();
      httpMock.expectOne(`${API}/cliente-1`).flush(wrap(mockClienteBackend()));

      expect(service.clienteRaw()?.id).toBe('cliente-1');
    });

    it('actualiza signal contactos cuando hay familiar', () => {
      const data = mockClienteBackend({
        contactosFamiliares: [{
          id: 'fam-1',
          nombre: 'Juan',
          dni: '99999999Z',
          email: 'juan@test.es',
          telefono: '612345678',
        }],
      });
      service.loadAll('cliente-1').subscribe();
      httpMock.expectOne(`${API}/cliente-1`).flush(wrap(data));

      expect(service.contactos()?.nombrePadre).toBe('Juan');
    });

    it('pone contactos a null si no hay familiares', () => {
      service.loadAll('cliente-1').subscribe();
      httpMock.expectOne(`${API}/cliente-1`).flush(wrap(mockClienteBackend({ contactosFamiliares: [] })));

      expect(service.contactos()).toBeNull();
    });

    it('devuelve void al completar', (done) => {
      service.loadAll('cliente-1').subscribe({
        next: (val) => expect(val).toBeUndefined(),
        complete: done,
      });
      httpMock.expectOne(`${API}/cliente-1`).flush(wrap(mockClienteBackend()));
    });
  });

  // ── verificarDniDisponible ────────────────────────────────────────────────
  describe('verificarDniDisponible()', () => {
    it('hace GET a /clientes/verificar-dni/:dni', () => {
      const data = { dni: '99999999Z', disponible: true };
      service.verificarDniDisponible('99999999Z').subscribe((res) => expect(res.disponible).toBe(true));

      const req = httpMock.expectOne(`${API}/verificar-dni/99999999Z`);
      expect(req.request.method).toBe('GET');
      req.flush(wrap(data));
    });
  });

  // ── familiares ────────────────────────────────────────────────────────────
  describe('crearFamiliar()', () => {
    it('hace POST a /clientes/:id/familiares', () => {
      const dto = { nombre: 'María', dni: '11111111A', email: 'm@test.es' };
      service.crearFamiliar('cliente-1', dto).subscribe();

      const req = httpMock.expectOne(`${API}/cliente-1/familiares`);
      expect(req.request.method).toBe('POST');
      req.flush(wrap({ id: 'fam-1', ...dto }));
    });
  });

  describe('updateFamiliar()', () => {
    it('hace PATCH a /clientes/:id/familiares/:familiarId', () => {
      service.updateFamiliar('cliente-1', 'fam-1', { nombre: 'María J.' }).subscribe();

      const req = httpMock.expectOne(`${API}/cliente-1/familiares/fam-1`);
      expect(req.request.method).toBe('PATCH');
      req.flush(wrap({}));
    });
  });

  describe('eliminarFamiliar()', () => {
    it('hace DELETE a /clientes/:id/familiares/:familiarId', () => {
      service.eliminarFamiliar('cliente-1', 'fam-1').subscribe();

      const req = httpMock.expectOne(`${API}/cliente-1/familiares/fam-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(wrap({ message: 'Eliminado' }));
    });
  });

  // ── sanitario y colegio ───────────────────────────────────────────────────
  describe('updateSanitario()', () => {
    it('hace PATCH a /clientes/:id/sanitario', () => {
      service.updateSanitario('cliente-1', { alergias: 'Polen' }).subscribe();

      const req = httpMock.expectOne(`${API}/cliente-1/sanitario`);
      expect(req.request.method).toBe('PATCH');
      req.flush(wrap({}));
    });
  });

  describe('updateColegio()', () => {
    it('hace PATCH a /clientes/:id/colegio', () => {
      service.updateColegio('cliente-1', { nombreDelCentro: 'CEIP Ejemplo' }).subscribe();

      const req = httpMock.expectOne(`${API}/cliente-1/colegio`);
      expect(req.request.method).toBe('PATCH');
      req.flush(wrap({}));
    });
  });

  // ── objetivos ─────────────────────────────────────────────────────────────
  describe('getObjetivosCliente()', () => {
    it('hace GET a /clientes/:id/objetivos-generales y actualiza signal', () => {
      service.getObjetivosCliente('cliente-1').subscribe();

      const req = httpMock.expectOne(`${API}/cliente-1/objetivos-generales`);
      expect(req.request.method).toBe('GET');
      req.flush(wrap({ cliente: 'cliente-1', objetivos: [] }));

      expect(service.objetivos()).not.toBeNull();
    });
  });

  describe('getEstadisticasObjetivos()', () => {
    it('hace GET a /clientes/:id/objetivos-generales/estadisticas y actualiza signal', () => {
      service.getEstadisticasObjetivos('cliente-1').subscribe();

      const req = httpMock.expectOne(`${API}/cliente-1/objetivos-generales/estadisticas`);
      expect(req.request.method).toBe('GET');
      req.flush(wrap({ cliente: 'cliente-1', totalObjetivosAsignados: 5, totalSesiones: 20, objetivosMasTrabajados: [] }));

      expect(service.estadisticasObjetivos()).not.toBeNull();
    });
  });

  // ── terapeutas ────────────────────────────────────────────────────────────
  describe('asignarTrabajador()', () => {
    it('hace POST a /clientes/:id/asignar-trabajador', () => {
      const body = {
        trabajadorId: 'trab-1',
        tipoTerapia: 'PEDAGOGIA',
        horarios: [{ diaSemana: 1, horaInicio: '09:00', horaFin: '10:00' }],
      };
      service.asignarTrabajador('cliente-1', body).subscribe();

      const req = httpMock.expectOne(`${API}/cliente-1/asignar-trabajador`);
      expect(req.request.method).toBe('POST');
      req.flush(wrap({ id: 'asignacion-1' }));
    });
  });

  describe('desasignarTrabajador()', () => {
    it('hace DELETE a /clientes/:id/asignaciones/:asignacionId', () => {
      service.desasignarTrabajador('cliente-1', 'asig-1').subscribe();

      const req = httpMock.expectOne(`${API}/cliente-1/asignaciones/asig-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(wrap({ message: 'Desasignado' }));
    });
  });

  // ── clearCliente ──────────────────────────────────────────────────────────
  describe('clearCliente()', () => {
    it('limpia todos los signals', () => {
      service.cliente.set({ nombre: 'Ana' } as any);
      service.clienteRaw.set({ id: 'cliente-1' } as any);
      service.contactos.set({} as any);
      service.colegio.set({} as any);
      service.sanitario.set({} as any);
      service.objetivos.set({} as any);
      service.estadisticasObjetivos.set({} as any);

      service.clearCliente();

      expect(service.cliente()).toBeNull();
      expect(service.clienteRaw()).toBeNull();
      expect(service.contactos()).toBeNull();
      expect(service.colegio()).toBeNull();
      expect(service.sanitario()).toBeNull();
      expect(service.objetivos()).toBeNull();
      expect(service.estadisticasObjetivos()).toBeNull();
    });
  });
});
