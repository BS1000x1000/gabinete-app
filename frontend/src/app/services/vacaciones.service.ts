import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { PeriodoVacaciones, CreateVacacionesPayload } from '../interface/vacaciones.interface';

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

  eliminar(id: string) {
    return this.http.delete(`${this.api}/${id}`).pipe(
      tap(() => this._misVacaciones.update(list => list.filter(v => v.id !== id))),
      map(() => void 0),
    );
  }
}
