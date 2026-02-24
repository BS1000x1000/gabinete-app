import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import {
  EstadisticasGenerales,
  EstadisticasTrabajador,
  ClienteMasActivo,
  ObjetivoMasTrabajado,
  ActividadReciente,
  ResumenDashboard,
} from '../interface/dashboard.interface';

// ✅ NUEVO: Interface para respuestas envueltas
interface WrappedResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/dashboard`;

  // Estado reactivo
  estadisticas = signal<EstadisticasTrabajador | EstadisticasGenerales | null>(null);
  resumenCompleto = signal<ResumenDashboard | null>(null);
  isLoading = signal(false);

  // ========================================
  // ESTADÍSTICAS
  // ========================================

  /**
   * Obtener estadísticas generales del sistema (admin)
   */
  getEstadisticasGenerales(): Observable<EstadisticasGenerales> {
    this.isLoading.set(true);
    return this.http
      .get<WrappedResponse<EstadisticasGenerales>>(`${this.api}/estadisticas-generales`)
      .pipe(
        map((res) => res.data || res),
        tap({
          next: (stats) => {
            this.estadisticas.set(stats);
            this.isLoading.set(false);
            console.log('📊 Estadísticas generales cargadas');
          },
          error: () => this.isLoading.set(false),
        })
      );
  }

  /**
   * Obtener estadísticas del trabajador autenticado
   */
  getMisEstadisticas(): Observable<EstadisticasTrabajador> {
    this.isLoading.set(true);
    return this.http
      .get<WrappedResponse<EstadisticasTrabajador>>(`${this.api}/mis-estadisticas`)
      .pipe(
        map((res) => res.data || res),
        tap({
          next: (stats) => {
            this.estadisticas.set(stats);
            this.isLoading.set(false);
            console.log('📊 Mis estadísticas cargadas');
          },
          error: () => this.isLoading.set(false),
        })
      );
  }

  /**
   * Obtener clientes más activos
   */
  getClientesMasActivos(limite: number = 10): Observable<ClienteMasActivo[]> {
    const params = new HttpParams().set('limite', limite.toString());
    return this.http
      .get<WrappedResponse<ClienteMasActivo[]>>(`${this.api}/clientes-mas-activos`, { params })
      .pipe(map((res) => res.data || res));
  }

  /**
   * Obtener objetivos más trabajados
   */
  getObjetivosMasTrabajados(limite: number = 10): Observable<ObjetivoMasTrabajado[]> {
    const params = new HttpParams().set('limite', limite.toString());
    return this.http
      .get<WrappedResponse<ObjetivoMasTrabajado[]>>(`${this.api}/objetivos-mas-trabajados`, { params })
      .pipe(map((res) => res.data || res));
  }

  /**
   * Obtener actividad reciente
   */
  getActividadReciente(limite: number = 10): Observable<ActividadReciente[]> {
    const params = new HttpParams().set('limite', limite.toString());
    return this.http
      .get<WrappedResponse<ActividadReciente[]>>(`${this.api}/actividad-reciente`, { params })
      .pipe(map((res) => res.data || res));
  }

  /**
   * Obtener distribución de sesiones por tipo
   */
  getDistribucionSesiones(): Observable<{ tipo: string; cantidad: number }[]> {
    return this.http
      .get<WrappedResponse<{ tipo: string; cantidad: number }[]>>(
        `${this.api}/distribucion-sesiones`
      )
      .pipe(map((res) => res.data || res));
  }

  /**
   * Obtener resumen completo del dashboard
   */
  getResumenCompleto(): Observable<ResumenDashboard> {
    this.isLoading.set(true);
    return this.http
      .get<WrappedResponse<ResumenDashboard>>(`${this.api}/resumen`)
      .pipe(
        map((res) => res.data || res),
        tap({
          next: (resumen) => {
            this.resumenCompleto.set(resumen);
            this.estadisticas.set(resumen.estadisticas);
            this.isLoading.set(false);
            console.log('📊 Resumen completo del dashboard cargado');
          },
          error: () => this.isLoading.set(false),
        })
      );
  }

  // ========================================
  // HELPERS
  // ========================================

  /**
   * Limpiar estado
   */
  clearState() {
    this.estadisticas.set(null);
    this.resumenCompleto.set(null);
    this.isLoading.set(false);
  }
}