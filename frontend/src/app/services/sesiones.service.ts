import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import {
  SesionData,
  CreateSesionDto,
  CompletarSesionDto,
  EstadoSesion,
} from '../interface/sesion.interface';
import {
  CalendarioDiario,
  CalendarioSemanal,
} from '../interface/calendario.interface';

// ✅ NUEVO: Interface para respuesta envuelta
interface WrappedResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class SesionesService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/sesiones`;

  // Estado reactivo
  sesiones = signal<SesionData[]>([]);
  selectedId = signal<string>('');
  isLoading = signal(false);
  /** Total en servidor de la ultima carga por cliente: delata el truncado. */
  totalServidor = signal<number | null>(null);

  // ========================================
  // CRUD BÁSICO
  // ========================================

  /**
   * Obtener sesiones por cliente
   */
  getSesionesByCliente(clienteId: string): Observable<SesionData[]> {
    this.isLoading.set(true);
    // El endpoint pagina; se pide el maximo permitido (PaginationDto: Max 500) y
    // se pagina en cliente, porque el orden de la tabla (futuras asc + pasadas
    // desc) no se reproduce con un skip/take.
    return this.http
      .get<any>(`${this.api}/cliente/${clienteId}?limit=500`)
      .pipe(
        // La respuesta va doblemente envuelta: { success, data: { data, total, ... } }
        map((res: any) => {
          this.totalServidor.set(res?.data?.total ?? null);
          return (res?.data?.data ?? res?.data ?? res) as SesionData[];
        }),
        tap({
          next: (sesiones) => {
            this.sesiones.set(sesiones);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false),
        }),
      );
  }

  /**
   * Obtener sesiones por trabajador
   */
  getSesionesByTrabajador(
    fechaInicio?: string,
    fechaFin?: string,
  ): Observable<SesionData[]> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    this.isLoading.set(true);
    return this.http
      .get<
        WrappedResponse<SesionData[]>
      >(`${this.api}/trabajador/horario`, { params })
      .pipe(
        map((res) => res.data || res), // ✅ Extraer data
        tap({
          next: (sesiones) => {
            this.sesiones.set(sesiones);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false),
        }),
      );
  }

  /**
   * Obtener una sesión por ID
   */
  getSesionById(id: string): Observable<SesionData> {
    return this.http
      .get<WrappedResponse<SesionData>>(`${this.api}/${id}`)
      .pipe(map((res) => res.data || res));
  }

  /**
   * Crear nueva sesión
   */
  createSesion(dto: CreateSesionDto): Observable<SesionData> {
    return this.http.post<WrappedResponse<SesionData>>(this.api, dto).pipe(
      map((res) => res.data || res),
      tap((nueva) => {
        this.sesiones.update((prev) => [...prev, nueva]);
      }),
    );
  }

  /**
   * Completar una sesión
   */
  completarSesion(id: string, dto: CompletarSesionDto): Observable<any> {
    return this.http
      .patch<WrappedResponse<any>>(`${this.api}/${id}/completar`, dto)
      .pipe(
        map((res) => res.data || res),
        tap(() => {
          this.sesiones.update((prev) =>
            prev.map((s) =>
              s.id === id ? { ...s, estado: EstadoSesion.COMPLETADA } : s,
            ),
          );
        }),
      );
  }

  /**
   * Cancelar una sesión
   */
  cancelarSesion(id: string, conAviso: boolean = true): Observable<SesionData> {
    return this.http
      .patch<
        WrappedResponse<SesionData>
      >(`${this.api}/${id}/cancelar`, { conAviso })
      .pipe(
        map((res) => res.data || res),
        tap((sesionActualizada) => {
          this.sesiones.update((prev) =>
            prev.map((s) => (s.id === id ? sesionActualizada : s)),
          );
        }),
      );
  }

  /**
   * Actualizar una sesión
   */
  updateSesion(id: string, data: Partial<SesionData>): Observable<SesionData> {
    return this.http
      .patch<WrappedResponse<SesionData>>(`${this.api}/${id}`, data)
      .pipe(
        map((res) => res.data || res),
        tap((actualizada) => {
          this.sesiones.update((prev) =>
            prev.map((s) => (s.id === id ? actualizada : s)),
          );
        }),
      );
  }

  /**
   * Eliminar una sesión
   */
  deleteSesion(id: string): Observable<{ message: string }> {
    return this.http
      .delete<WrappedResponse<{ message: string }>>(`${this.api}/${id}`)
      .pipe(
        map((res) => res.data || res),
        tap(() => {
          this.sesiones.update((prev) => prev.filter((s) => s.id !== id));
        }),
      );
  }

  // ========================================
  // GENERACIÓN AUTOMÁTICA
  // ========================================

  /*
   * `generarSesiones()` se retiro (2026-08-31) junto con su endpoint.
   * El horario recurrente lo define el contrato; para una sesion suelta esta
   * `createSesion()`, que ahora si tiene endpoint en el backend.
   */


  // ========================================
  // CALENDARIOS
  // ========================================

  getCalendarioDiario(fecha?: string, trabajadorId?: string): Observable<CalendarioDiario> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);
    if (trabajadorId) params = params.set('trabajadorId', trabajadorId);

    return this.http
      .get<
        WrappedResponse<CalendarioDiario>
      >(`${this.api}/mi-calendario/diario`, { params })
      .pipe(
        map((res) => res.data || res),
        tap(() => {}),
      );
  }

  /**
   * Obtener calendario semanal del trabajador autenticado (o el indicado por ADMIN/RECEP)
   */
  getCalendarioSemanal(fecha?: string, trabajadorId?: string): Observable<CalendarioSemanal> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);
    if (trabajadorId) params = params.set('trabajadorId', trabajadorId);

    return this.http
      .get<
        WrappedResponse<CalendarioSemanal>
      >(`${this.api}/mi-calendario/semanal`, { params })
      .pipe(map((res) => res.data || res));
  }

  /**
   * Obtener calendario mensual del trabajador autenticado
   */
  getCalendarioMensual(fecha?: string): Observable<any> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);

    return this.http
      .get<
        WrappedResponse<any>
      >(`${this.api}/mi-calendario/mensual`, { params })
      .pipe(map((res) => res.data || res));
  }

  /**
   * Obtener sesiones de hoy del trabajador autenticado
   */
  // getSesionesHoy(): Observable<SesionesHoyResponse> {
  //   return this.http
  //     .get<WrappedResponse<SesionesHoyResponse>>(`${this.api}/hoy`)
  //     .pipe(map((res) => res.data || res));
  // }

  // ========================================
  // HELPERS
  // ========================================

  /**
   * Establecer ID seleccionado (para UI)
   */
  setSelectedId(id: string) {
    this.selectedId.set(id);
  }

  /**
   * Limpiar estado
   */
  clearState() {
    this.sesiones.set([]);
    this.selectedId.set('');
    this.isLoading.set(false);
  }
}
