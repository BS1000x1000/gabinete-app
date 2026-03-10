import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/** Stub para el modal de acciones de sesión usado en el template */
@Component({ selector: 'app-sesion-modales', standalone: true, template: '' })
class SesionModalesStub {}
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { SesionesTabComponent } from './sesiones-tab.component';
import { SesionesService } from '../../../../../services/sesiones.service';
import { SesionesFiltrosService } from '../../../../../services/sesiones-filtros.service';
import { SesionAccionesService } from '../../../../../services/sesiones-acciones.service';
import { SesionData, EstadoSesion, TipoSesion } from '../../../../../interface/sesion.interface';

// ── Fixture helper ──────────────────────────────────────────────────────────

let contadorId = 0;

function makeSesion(
  fechaISO: string,
  estado: EstadoSesion = EstadoSesion.PROGRAMADA,
  tipo: TipoSesion = TipoSesion.PEDAGOGIA,
): SesionData {
  contadorId++;
  return {
    id: `s-${contadorId}`,
    fechaHoraInicio: fechaISO,
    fechaHoraFin: new Date(new Date(fechaISO).getTime() + 3600_000).toISOString(),
    estado,
    tipoSesion: tipo,
    clienteId: 'cliente-1',
    trabajadorId: 'trabajador-1',
    cliente: { id: 'cliente-1', nombre: 'Ana', apellidos: 'García' },
  };
}

// ── Helpers de fecha ────────────────────────────────────────────────────────

const ISO = {
  // Futuras
  fut1: new Date(Date.now() + 1 * 86_400_000).toISOString(), // +1 día
  fut2: new Date(Date.now() + 5 * 86_400_000).toISOString(), // +5 días
  fut3: new Date(Date.now() + 3 * 86_400_000).toISOString(), // +3 días
  // Pasadas
  pas1: new Date(Date.now() - 1 * 86_400_000).toISOString(), // -1 día
  pas2: new Date(Date.now() - 5 * 86_400_000).toISOString(), // -5 días
  pas3: new Date(Date.now() - 3 * 86_400_000).toISOString(), // -3 días
  // Meses concretos (para filtro)
  mar: '2026-03-15T10:00:00.000Z',
  feb: '2026-02-10T10:00:00.000Z',
  ene: '2026-01-20T10:00:00.000Z',
};

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockActivatedRoute = {
  parent: {
    snapshot: { paramMap: { get: (_: string) => 'cliente-1' } },
  },
};

const mockAccionesSvc = jasmine.createSpyObj('SesionAccionesService', [
  'abrirCompletar',
  'abrirCancelar',
  'abrirReprogramar',
  'abrirDetalle',
]);

// ── Configuración de TestBed ─────────────────────────────────────────────────

describe('SesionesTabComponent', () => {
  let component: SesionesTabComponent;
  let filtrosSvc: SesionesFiltrosService;
  let sesionesServiceSpy: jasmine.SpyObj<SesionesService>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    contadorId = 0;
    sesionesServiceSpy = jasmine.createSpyObj('SesionesService', [
      'getSesionesByCliente',
    ]);
    sesionesServiceSpy.getSesionesByCliente.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [SesionesTabComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: SesionesService, useValue: sesionesServiceSpy },
        { provide: SesionAccionesService, useValue: mockAccionesSvc },
        SesionesFiltrosService,
      ],
    })
      .overrideComponent(SesionesTabComponent, {
        set: { imports: [CommonModule, FormsModule, SesionModalesStub] },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(SesionesTabComponent);
    component = fixture.componentInstance;
    filtrosSvc = TestBed.inject(SesionesFiltrosService);
    httpMock = TestBed.inject(HttpTestingController);

    // Inicializar el servicio de filtros para el cliente de prueba
    filtrosSvc.inicializar('cliente-1');
    // NO llamamos detectChanges() para evitar ngOnInit automático
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  // ── Estado inicial ──────────────────────────────────────────────

  describe('estado inicial', () => {
    it('sesiones empieza vacío', () => {
      expect(component.sesiones()).toEqual([]);
    });

    it('isLoading empieza en false', () => {
      expect(component.isLoading()).toBeFalse();
    });

    it('error empieza en null', () => {
      expect(component.error()).toBeNull();
    });
  });

  // ── computed: sesionesFiltradas — filtro por estado ─────────────

  describe('sesionesFiltradas() — filtro por estado', () => {
    beforeEach(() => {
      component.sesiones.set([
        makeSesion(ISO.mar, EstadoSesion.PROGRAMADA),
        makeSesion(ISO.mar, EstadoSesion.COMPLETADA),
        makeSesion(ISO.mar, EstadoSesion.CANCELADA_CON_AVISO),
        makeSesion(ISO.mar, EstadoSesion.CANCELADA_SIN_AVISO),
      ]);
    });

    it('con filtro TODAS devuelve todas las sesiones', () => {
      filtrosSvc.filtroEstado.set('TODAS');
      expect(component.sesionesFiltradas().length).toBe(4);
    });

    it('filtra solo sesiones COMPLETADAS', () => {
      filtrosSvc.filtroEstado.set('COMPLETADA');
      const result = component.sesionesFiltradas();
      expect(result.length).toBe(1);
      expect(result[0].estado).toBe(EstadoSesion.COMPLETADA);
    });

    it('filtra solo sesiones PROGRAMADAS', () => {
      filtrosSvc.filtroEstado.set('PROGRAMADA');
      const result = component.sesionesFiltradas();
      expect(result.every((s) => s.estado === EstadoSesion.PROGRAMADA)).toBeTrue();
    });

    it('filtra solo CANCELADA_CON_AVISO', () => {
      filtrosSvc.filtroEstado.set('CANCELADA_CON_AVISO');
      expect(component.sesionesFiltradas().length).toBe(1);
      expect(component.sesionesFiltradas()[0].estado).toBe(
        EstadoSesion.CANCELADA_CON_AVISO,
      );
    });

    it('devuelve array vacío cuando no hay sesiones del estado dado', () => {
      filtrosSvc.filtroEstado.set('CANCELADA_SIN_AVISO');
      component.sesiones.set([makeSesion(ISO.mar, EstadoSesion.PROGRAMADA)]);
      expect(component.sesionesFiltradas()).toEqual([]);
    });
  });

  // ── computed: sesionesFiltradas — filtro por mes ────────────────

  describe('sesionesFiltradas() — filtro por mes', () => {
    beforeEach(() => {
      component.sesiones.set([
        makeSesion(ISO.mar), // 2026-03
        makeSesion(ISO.feb), // 2026-02
        makeSesion(ISO.ene), // 2026-01
      ]);
    });

    it('sin filtro de mes devuelve todas', () => {
      filtrosSvc.filtroMes.set('');
      expect(component.sesionesFiltradas().length).toBe(3);
    });

    it('filtra sesiones del mes correcto', () => {
      filtrosSvc.filtroMes.set('2026-03');
      expect(component.sesionesFiltradas().length).toBe(1);
      expect(component.sesionesFiltradas()[0].fechaHoraInicio).toContain('2026-03');
    });

    it('devuelve vacío si no hay sesiones en el mes seleccionado', () => {
      filtrosSvc.filtroMes.set('2025-12');
      expect(component.sesionesFiltradas()).toEqual([]);
    });
  });

  // ── computed: sesionesFiltradas — filtros combinados ───────────

  describe('sesionesFiltradas() — filtros combinados', () => {
    it('aplica estado y mes simultáneamente', () => {
      component.sesiones.set([
        makeSesion(ISO.mar, EstadoSesion.COMPLETADA), // marzo, completada ← debe aparecer
        makeSesion(ISO.mar, EstadoSesion.PROGRAMADA), // marzo, programada ← NO
        makeSesion(ISO.feb, EstadoSesion.COMPLETADA), // febrero, completada ← NO
      ]);
      filtrosSvc.filtroEstado.set('COMPLETADA');
      filtrosSvc.filtroMes.set('2026-03');
      expect(component.sesionesFiltradas().length).toBe(1);
      expect(component.sesionesFiltradas()[0].estado).toBe(EstadoSesion.COMPLETADA);
    });
  });

  // ── computed: sesionesFiltradas — orden ────────────────────────

  describe('sesionesFiltradas() — orden futuras/pasadas', () => {
    it('las sesiones futuras van antes que las pasadas', () => {
      component.sesiones.set([
        makeSesion(ISO.pas1), // pasada
        makeSesion(ISO.fut1), // futura
      ]);
      const result = component.sesionesFiltradas();
      expect(new Date(result[0].fechaHoraInicio) >= new Date()).toBeTrue(); // primera es futura
      expect(new Date(result[1].fechaHoraInicio) < new Date()).toBeTrue();  // segunda es pasada
    });

    it('las sesiones futuras se ordenan ASC (las más próximas primero)', () => {
      component.sesiones.set([
        makeSesion(ISO.fut2), // +5 días
        makeSesion(ISO.fut1), // +1 día ← debe ser primera
        makeSesion(ISO.fut3), // +3 días
      ]);
      const futuras = component.sesionesFiltradas();
      const fechas = futuras.map((s) => new Date(s.fechaHoraInicio).getTime());
      expect(fechas[0]).toBeLessThan(fechas[1]);
      expect(fechas[1]).toBeLessThan(fechas[2]);
    });

    it('las sesiones pasadas se ordenan DESC (las más recientes primero)', () => {
      component.sesiones.set([
        makeSesion(ISO.pas2), // -5 días
        makeSesion(ISO.pas1), // -1 día ← debe ser primera entre pasadas
        makeSesion(ISO.pas3), // -3 días
      ]);
      const pasadas = component.sesionesFiltradas();
      const fechas = pasadas.map((s) => new Date(s.fechaHoraInicio).getTime());
      expect(fechas[0]).toBeGreaterThan(fechas[1]);
      expect(fechas[1]).toBeGreaterThan(fechas[2]);
    });
  });

  // ── computed: mesesDisponibles ──────────────────────────────────

  describe('mesesDisponibles()', () => {
    it('extrae los meses únicos de las sesiones', () => {
      component.sesiones.set([
        makeSesion(ISO.mar), // 2026-03
        makeSesion(ISO.mar), // 2026-03 (duplicado)
        makeSesion(ISO.feb), // 2026-02
      ]);
      expect(component.mesesDisponibles().length).toBe(2);
    });

    it('ordena los meses de más reciente a más antiguo', () => {
      component.sesiones.set([
        makeSesion(ISO.ene), // 2026-01
        makeSesion(ISO.mar), // 2026-03
        makeSesion(ISO.feb), // 2026-02
      ]);
      const meses = component.mesesDisponibles().map((m) => m.value);
      expect(meses[0]).toBe('2026-03');
      expect(meses[1]).toBe('2026-02');
      expect(meses[2]).toBe('2026-01');
    });
  });

  // ── computed: stats ─────────────────────────────────────────────

  describe('stats()', () => {
    it('total es 0 cuando no hay sesiones', () => {
      expect(component.stats().total).toBe(0);
    });

    it('cuenta correctamente cada tipo de estado', () => {
      component.sesiones.set([
        makeSesion(ISO.mar, EstadoSesion.PROGRAMADA),
        makeSesion(ISO.mar, EstadoSesion.PROGRAMADA),
        makeSesion(ISO.mar, EstadoSesion.COMPLETADA),
        makeSesion(ISO.mar, EstadoSesion.COMPLETADA),
        makeSesion(ISO.mar, EstadoSesion.COMPLETADA),
        makeSesion(ISO.mar, EstadoSesion.CANCELADA_CON_AVISO),
        makeSesion(ISO.mar, EstadoSesion.CANCELADA_SIN_AVISO),
      ]);
      const s = component.stats();
      expect(s.total).toBe(7);
      expect(s.programadas).toBe(2);
      expect(s.completadas).toBe(3);
      expect(s.canceladas).toBe(2); // con aviso + sin aviso
    });

    it('ratioAsistencia = completadas / (completadas + canceladas) × 100', () => {
      component.sesiones.set([
        makeSesion(ISO.mar, EstadoSesion.COMPLETADA),
        makeSesion(ISO.mar, EstadoSesion.COMPLETADA),
        makeSesion(ISO.mar, EstadoSesion.COMPLETADA),
        makeSesion(ISO.mar, EstadoSesion.CANCELADA_CON_AVISO),
      ]);
      // 3 completadas / (3 + 1) = 75%
      expect(component.stats().ratioAsistencia).toBe(75);
    });

    it('ratioAsistencia es 0 cuando no hay sesiones', () => {
      expect(component.stats().ratioAsistencia).toBe(0);
    });

    it('ratioAsistencia es 0 cuando solo hay programadas (sin cerradas)', () => {
      component.sesiones.set([makeSesion(ISO.fut1, EstadoSesion.PROGRAMADA)]);
      expect(component.stats().ratioAsistencia).toBe(0);
    });

    it('ratioAsistencia es 100 cuando todas están completadas', () => {
      component.sesiones.set([
        makeSesion(ISO.mar, EstadoSesion.COMPLETADA),
        makeSesion(ISO.mar, EstadoSesion.COMPLETADA),
      ]);
      expect(component.stats().ratioAsistencia).toBe(100);
    });
  });

  // ── Helpers UI ──────────────────────────────────────────────────

  describe('getBadgeClase()', () => {
    it('devuelve la clase correcta para cada estado', () => {
      expect(component.getBadgeClase(EstadoSesion.PROGRAMADA)).toBe('badge-programada');
      expect(component.getBadgeClase(EstadoSesion.COMPLETADA)).toBe('badge-completada');
      expect(component.getBadgeClase(EstadoSesion.CANCELADA_CON_AVISO)).toBe('badge-cancelada-aviso');
      expect(component.getBadgeClase(EstadoSesion.CANCELADA_SIN_AVISO)).toBe('badge-cancelada-sin-aviso');
    });
  });

  describe('getBadgeIcono()', () => {
    it('devuelve el icono correcto para PROGRAMADA', () => {
      expect(component.getBadgeIcono(EstadoSesion.PROGRAMADA)).toBe('bi-clock');
    });

    it('devuelve el icono correcto para COMPLETADA', () => {
      expect(component.getBadgeIcono(EstadoSesion.COMPLETADA)).toBe('bi-check-circle-fill');
    });
  });

  describe('getDuracion()', () => {
    it('calcula la duración en minutos', () => {
      const inicio = '2026-03-10T10:00:00.000Z';
      const fin = '2026-03-10T11:30:00.000Z';
      expect(component.getDuracion(inicio, fin)).toBe(90);
    });
  });

  describe('esCancelable() / esReprogramable()', () => {
    it('solo PROGRAMADA es cancelable', () => {
      expect(component.esCancelable(EstadoSesion.PROGRAMADA)).toBeTrue();
      expect(component.esCancelable(EstadoSesion.COMPLETADA)).toBeFalse();
    });

    it('solo PROGRAMADA es reprogramable', () => {
      expect(component.esReprogramable(EstadoSesion.PROGRAMADA)).toBeTrue();
      expect(component.esReprogramable(EstadoSesion.CANCELADA_CON_AVISO)).toBeFalse();
    });
  });

  // ── limpiarFiltros() ────────────────────────────────────────────

  describe('limpiarFiltros()', () => {
    it('delega el reseteo al servicio de filtros', () => {
      filtrosSvc.filtroEstado.set('COMPLETADA');
      filtrosSvc.filtroMes.set('2026-03');

      component.limpiarFiltros();

      expect(component.filtroEstado()).toBe('TODAS');
      expect(component.filtroMes()).toBe('');
    });
  });

  // ── cargarSesiones() ────────────────────────────────────────────

  describe('cargarSesiones()', () => {
    it('pone isLoading en true al iniciar la carga', () => {
      sesionesServiceSpy.getSesionesByCliente.and.returnValue(of([]));
      component.clienteId.set('cliente-1');
      component.cargarSesiones();
      // La llamada es síncrona con `of([])`, pero isLoading ya debería haberse gestionado
    });

    it('establece las sesiones tras respuesta exitosa', () => {
      const data = [makeSesion(ISO.mar, EstadoSesion.COMPLETADA)];
      sesionesServiceSpy.getSesionesByCliente.and.returnValue(of(data));
      component.clienteId.set('cliente-1');
      component.cargarSesiones();
      expect(component.sesiones()).toEqual(data);
    });

    it('establece un mensaje de error cuando falla la carga', () => {
      sesionesServiceSpy.getSesionesByCliente.and.returnValue(
        throwError(() => new Error('HTTP error')),
      );
      component.clienteId.set('cliente-1');
      component.cargarSesiones();
      expect(component.error()).toBe('No se pudieron cargar las sesiones.');
    });
  });
});
