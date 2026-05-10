import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { Festivo, CreateFestivoPayload } from '../interface/festivo.interface';

interface WrappedResponse<T> { data: T }

@Injectable({ providedIn: 'root' })
export class FestivosService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/festivos`;

  private _festivos = signal<Festivo[]>([]);
  readonly festivos = this._festivos.asReadonly();

  getFestivos(anio: number) {
    return this.http.get<Festivo[]>(`${this.api}?anio=${anio}`).pipe(
      tap(data => this._festivos.set(Array.isArray(data) ? data : (data as any)?.data ?? [])),
    );
  }

  crear(payload: CreateFestivoPayload) {
    return this.http.post<Festivo>(this.api, payload).pipe(
      tap(f => {
        const item = (f as any)?.data ?? f;
        this._festivos.update(list => [...list, item].sort(
          (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        ));
      }),
    );
  }

  eliminar(id: string) {
    return this.http.delete(`${this.api}/${id}`).pipe(
      tap(() => this._festivos.update(list => list.filter(f => f.id !== id))),
      map(() => void 0),
    );
  }

  importarNacionales(anio: number) {
    return this.http.post<{ importados: number; omitidos: number }>(
      `${this.api}/importar-nacionales/${anio}`, {},
    ).pipe(
      switchMap(() => this.getFestivos(anio)),
    );
  }

  tieneNacionales(anio: number) {
    return this.http.get<boolean>(`${this.api}/tiene-nacionales/${anio}`);
  }

  getFestivosParaAgenda(anio: number) {
    return this.http.get<Festivo[]>(`${this.api}?anio=${anio}`).pipe(
      map(data => Array.isArray(data) ? data : (data as any)?.data ?? []),
    );
  }
}
