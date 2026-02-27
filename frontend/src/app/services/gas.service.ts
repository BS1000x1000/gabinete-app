import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { CreateEvaluacionDto, DescripcionNivelGAS, EvaluacionGAS, ResumenObjetivoGAS, SetDescripcionesNivelesDto } from '../interface/gas.interface';


interface WrappedResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class GasService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/gas`;

  // Signal con el resumen del objetivo actualmente abierto en el panel
  resumenActivo = signal<ResumenObjetivoGAS | null>(null);
  cargando = signal(false);

  // ============================================================
  // RESUMEN COMPLETO (niveles + historial)
  // ============================================================

  getResumenObjetivo(clienteObjetivoId: string): Observable<ResumenObjetivoGAS> {
    this.cargando.set(true);
    return this.http
      .get<WrappedResponse<ResumenObjetivoGAS>>(
        `${this.api}/objetivo/${clienteObjetivoId}`,
      )
      .pipe(
        map((res) => res.data || res),
        tap({
          next: (resumen) => {
            this.resumenActivo.set(resumen);
            this.cargando.set(false);
          },
          error: () => this.cargando.set(false),
        }),
      );
  }

  // ============================================================
  // DESCRIPCIONES DE NIVELES
  // ============================================================

  setDescripcionesNiveles(
    clienteObjetivoId: string,
    dto: SetDescripcionesNivelesDto,
  ): Observable<{ message: string; niveles: DescripcionNivelGAS[] }> {
    return this.http
      .post<WrappedResponse<{ message: string; niveles: DescripcionNivelGAS[] }>>(
        `${this.api}/objetivo/${clienteObjetivoId}/niveles`,
        dto,
      )
      .pipe(map((res) => res.data || res));
  }

  updateDescripcionNivel(
    clienteObjetivoId: string,
    nivel: number,
    descripcion: string,
  ): Observable<DescripcionNivelGAS> {
    return this.http
      .patch<WrappedResponse<DescripcionNivelGAS>>(
        `${this.api}/objetivo/${clienteObjetivoId}/niveles/${nivel}`,
        { descripcion },
      )
      .pipe(map((res) => res.data || res));
  }

  // ============================================================
  // EVALUACIONES
  // ============================================================

  createEvaluacion(
    clienteObjetivoId: string,
    dto: CreateEvaluacionDto,
  ): Observable<EvaluacionGAS> {
    return this.http
      .post<WrappedResponse<EvaluacionGAS>>(
        `${this.api}/objetivo/${clienteObjetivoId}/evaluaciones`,
        dto,
      )
      .pipe(
        map((res) => res.data || res),
        tap((evaluacion) => {
          // Actualizar el resumen activo localmente sin refetch
          const actual = this.resumenActivo();
          if (actual && actual.id === clienteObjetivoId) {
            this.resumenActivo.set({
              ...actual,
              nivelActual: evaluacion.nivel,
              fechaUltimaEvaluacion: evaluacion.fecha,
              historial: [evaluacion, ...actual.historial],
            });
          }
        }),
      );
  }

  deleteEvaluacion(evaluacionId: string): Observable<{ message: string }> {
    return this.http
      .delete<WrappedResponse<{ message: string }>>(
        `${this.api}/evaluaciones/${evaluacionId}`,
      )
      .pipe(map((res) => res.data || res));
  }
}