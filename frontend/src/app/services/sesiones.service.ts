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

  // ========================================
  // CRUD BÁSICO
  // ========================================

  /**
   * Obtener sesiones por cliente
   */
  getSesionesByCliente(clienteId: string): Observable<SesionData[]> {
    this.isLoading.set(true);
    return this.http
      .get<WrappedResponse<SesionData[]>>(`${this.api}/cliente/${clienteId}`)
      .pipe(
        map((res) => res.data || res), // ✅ Extraer data
        tap({
          next: (sesiones) => {
            this.sesiones.set(sesiones);
            this.isLoading.set(false);
            console.log(`✅ ${sesiones.length} sesiones del cliente cargadas`);
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
            console.log(
              `✅ ${sesiones.length} sesiones del trabajador cargadas`,
            );
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
        console.log('✅ Sesión creada:', nueva.id);
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
          console.log('✅ Sesión completada:', id);
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
          console.log('❌ Sesión cancelada:', id);
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
          console.log('✅ Sesión actualizada:', id);
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
          console.log('🗑️ Sesión eliminada:', id);
        }),
      );
  }

  // ========================================
  // GENERACIÓN AUTOMÁTICA
  // ========================================

  /**
   * Generar sesiones desde disponibilidad
   */
  generarSesiones(dto: {
    clienteId: string;
    trabajadorId: string;
    fechaInicio: string;
    fechaFin: string;
    tipoSesion?: string;
  }): Observable<any> {
    return this.http
      .post<WrappedResponse<any>>(`${this.api}/generar`, dto)
      .pipe(
        map((res) => res.data || res),
        tap((res) => {
          console.log('✅ Sesiones generadas:', res);
        }),
      );
  }

  // ========================================
  // CALENDARIOS
  // ========================================

  getCalendarioDiario(fecha?: string): Observable<CalendarioDiario> {
    const params = fecha
      ? new HttpParams().set('fecha', fecha)
      : new HttpParams();

    return this.http
      .get<
        WrappedResponse<CalendarioDiario>
      >(`${this.api}/mi-calendario/diario`, { params })
      .pipe(
        map((res) => res.data || res),
        tap((cal) => {
          console.log('📅 Calendario diario cargado:', cal);
          console.log(`   ${cal.diaSemana} ${cal.fechaFormateada}`);
          console.log(`   ${cal.sesiones.length} sesiones`);
        }),
      );
  }

  /**
   * Obtener calendario semanal del trabajador autenticado
   */
  getCalendarioSemanal(fecha?: string): Observable<CalendarioSemanal> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);

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
