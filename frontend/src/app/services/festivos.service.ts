import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import {
  Festivo,
  CreateFestivoPayload,
  UpdateFestivoPayload,
  ConfiguracionCentro,
  CatalogoFestivos,
  ResultadoImportacion,
  FestivoPrevisto,
  FestivoDelCentro,
} from '../interface/festivo.interface';

@Injectable({ providedIn: 'root' })
export class FestivosService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/festivos`;

  private _festivos = signal<Festivo[]>([]);
  readonly festivos = this._festivos.asReadonly();

  private _configuracion = signal<ConfiguracionCentro | null>(null);
  readonly configuracion = this._configuracion.asReadonly();

  private _catalogo = signal<CatalogoFestivos | null>(null);
  readonly catalogo = this._catalogo.asReadonly();

  /** El interceptor envuelve en `{ data }` según el endpoint; se desenvuelve aquí. */
  private desenvolver<T>(res: any): T {
    return (res?.data ?? res) as T;
  }

  // ── Calendario del centro ──────────────────────────────────

  getCatalogo() {
    return this.http.get<CatalogoFestivos>(`${this.api}/catalogo`).pipe(
      map(r => this.desenvolver<CatalogoFestivos>(r)),
      tap(c => this._catalogo.set(c)),
    );
  }

  getConfiguracion() {
    return this.http.get<ConfiguracionCentro>(`${this.api}/configuracion`).pipe(
      map(r => this.desenvolver<ConfiguracionCentro>(r)),
      tap(c => this._configuracion.set(c)),
    );
  }

  setConfiguracion(payload: { ccaaCodigo: string; municipio: string }) {
    return this.http.put<ConfiguracionCentro>(`${this.api}/configuracion`, payload).pipe(
      map(r => this.desenvolver<ConfiguracionCentro>(r)),
      tap(c => this._configuracion.set(c)),
    );
  }

  // ── Listado y CRUD ─────────────────────────────────────────

  getFestivos(anio: number) {
    return this.http.get<Festivo[]>(`${this.api}?anio=${anio}`).pipe(
      map(r => this.desenvolver<Festivo[]>(r) ?? []),
      tap(data => this._festivos.set(data)),
    );
  }

  crear(payload: CreateFestivoPayload) {
    return this.http.post<Festivo>(this.api, payload).pipe(
      map(r => this.desenvolver<Festivo>(r)),
      tap(item => {
        this._festivos.update(list => [...list, item].sort(
          (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        ));
      }),
    );
  }

  /**
   * Corregir sin borrar. Antes no existía: una fecha mal tecleada solo se
   * arreglaba borrando el festivo, y borrar un festivo es justo lo que hace que
   * un contrato salga con una sesión de más.
   */
  actualizar(id: string, payload: UpdateFestivoPayload) {
    return this.http.patch<Festivo>(`${this.api}/${id}`, payload).pipe(
      map(r => this.desenvolver<Festivo>(r)),
      tap(item => {
        this._festivos.update(list => list
          .map(f => (f.id === id ? item : f))
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()));
      }),
    );
  }

  eliminar(id: string) {
    return this.http.delete(`${this.api}/${id}`).pipe(
      tap(() => this._festivos.update(list => list.filter(f => f.id !== id))),
      map(() => void 0),
    );
  }

  // ── Importación ────────────────────────────────────────────

  previsualizar(anio: number) {
    return this.http.get<FestivoPrevisto[]>(`${this.api}/previsualizar/${anio}`).pipe(
      map(r => this.desenvolver<FestivoPrevisto[]>(r) ?? []),
    );
  }

  importarCalendario(anio: number) {
    return this.http.post<ResultadoImportacion>(`${this.api}/importar/${anio}`, {}).pipe(
      map(r => this.desenvolver<ResultadoImportacion>(r)),
      switchMap(res => this.getFestivos(anio).pipe(map(() => res))),
    );
  }

  /**
   * Los días que cierra el centro. Es lo que consume la agenda: antes pedía
   * `GET /festivos?anio=` sin filtrar ámbito y pintaba el festivo local de
   * cualquier municipio a todo el mundo.
   */
  getDelCentro(anio: number) {
    return this.http.get<FestivoDelCentro[]>(`${this.api}/del-centro?anio=${anio}`).pipe(
      map(r => this.desenvolver<FestivoDelCentro[]>(r) ?? []),
    );
  }
}
