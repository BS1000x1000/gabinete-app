import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { PeriodoVacaciones, CreateVacacionesPayload, ConflictoVacaciones } from '../interface/vacaciones.interface';

@Injectable({ providedIn: 'root' })
export class VacacionesService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/vacaciones`;

  private _misVacaciones = signal<PeriodoVacaciones[]>([]);
  readonly misVacaciones = this._misVacaciones.asReadonly();

  getMisVacaciones() {
    return this.http.get<PeriodoVacaciones[]>(`${this.api}/mis-vacaciones`).pipe(
      tap(data => {
        const list = Array.isArray(data) ? data : (data as any)?.data ?? [];
        this._misVacaciones.set(list);
      }),
    );
  }

  /** Carga vacaciones de un trabajador concreto (ADMIN o propio) */
  getVacacionesDe(trabajadorId: string) {
    const params = new HttpParams().set('trabajadorId', trabajadorId);
    return this.http.get<PeriodoVacaciones[]>(`${this.api}/mis-vacaciones`, { params }).pipe(
      map(data => Array.isArray(data) ? data : (data as any)?.data ?? []),
    );
  }

  crear(payload: CreateVacacionesPayload) {
    return this.http.post<PeriodoVacaciones>(this.api, payload).pipe(
      tap(item => {
        const v = (item as any)?.data ?? item;
        this._misVacaciones.update(list =>
          [...list, v].sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
        );
      }),
    );
  }

  /** Crea un periodo de vacaciones para un trabajador concreto (ADMIN o propio) */
  crearPara(trabajadorId: string, payload: CreateVacacionesPayload) {
    const params = new HttpParams().set('trabajadorId', trabajadorId);
    return this.http.post<PeriodoVacaciones>(this.api, payload, { params }).pipe(
      map(item => (item as any)?.data ?? item),
    );
  }

  eliminar(id: string) {
    return this.http.delete(`${this.api}/${id}`).pipe(
      tap(() => this._misVacaciones.update(list => list.filter(v => v.id !== id))),
      map(() => void 0),
    );
  }

  verificarConflictos(desde: string, hasta: string) {
    return this.http.get<ConflictoVacaciones>(
      `${this.api}/verificar-conflictos?desde=${desde}&hasta=${hasta}`,
    ).pipe(
      map(data => (data as any)?.data ?? data),
    );
  }

  /** Verifica conflictos para un trabajador concreto (ADMIN o propio) */
  verificarConflictosDe(trabajadorId: string, desde: string, hasta: string) {
    const params = new HttpParams()
      .set('desde', desde)
      .set('hasta', hasta)
      .set('trabajadorId', trabajadorId);
    return this.http.get<ConflictoVacaciones>(`${this.api}/verificar-conflictos`, { params }).pipe(
      map(data => (data as any)?.data ?? data),
    );
  }
}
