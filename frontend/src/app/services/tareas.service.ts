import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import {
  EjecucionTarea,
  ResumenTareaProgramada,
  Tarea,
} from '../interface/tarea.interface';

interface WrappedResponse<T> {
  data: T;
}

/**
 * Lectura del rastro que dejan las tareas programadas. Solo ADMIN en el backend.
 */
@Injectable({ providedIn: 'root' })
export class TareasService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/tareas`;

  /** Una entrada por tarea conocida, incluidas las que nunca se ejecutaron. */
  getResumen(): Observable<ResumenTareaProgramada[]> {
    return this.http
      .get<WrappedResponse<ResumenTareaProgramada[]>>(`${this.api}/ejecuciones`)
      .pipe(map((res) => res.data ?? []));
  }

  getHistorial(tarea?: Tarea, limite = 50): Observable<EjecucionTarea[]> {
    let params = new HttpParams().set('limite', limite);
    if (tarea) params = params.set('tarea', tarea);
    return this.http
      .get<WrappedResponse<EjecucionTarea[]>>(`${this.api}/ejecuciones/historial`, {
        params,
      })
      .pipe(map((res) => res.data ?? []));
  }
}
