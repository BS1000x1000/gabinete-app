import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { triggerDownload } from '../shared/utils/download.utils';

export interface ExportParams {
  formato: 'pdf' | 'excel';
  desde?: string;
  hasta?: string;
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/export`;

  exportSesiones(clienteId: string, params: ExportParams): Observable<void> {
    const q = this.buildParams(params);
    const ext = params.formato === 'excel' ? 'xlsx' : 'pdf';
    return this.http
      .get(`${this.api}/sesiones/${clienteId}`, { params: q, responseType: 'blob' })
      .pipe(
        tap((blob) => triggerDownload(blob, `sesiones_${clienteId}.${ext}`)),
        map(() => void 0),
      );
  }

  exportBonos(clienteId: string | null, params: ExportParams): Observable<void> {
    const q = this.buildParams(params);
    const ext = params.formato === 'excel' ? 'xlsx' : 'pdf';
    const url = clienteId
      ? `${this.api}/bonos/${clienteId}`
      : `${this.api}/bonos`;
    const filename = clienteId ? `bonos_${clienteId}.${ext}` : `bonos_todos.${ext}`;
    return this.http
      .get(url, { params: q, responseType: 'blob' })
      .pipe(
        tap((blob) => triggerDownload(blob, filename)),
        map(() => void 0),
      );
  }

  private buildParams(params: ExportParams): HttpParams {
    let q = new HttpParams().set('formato', params.formato);
    if (params.desde) q = q.set('desde', params.desde);
    if (params.hasta) q = q.set('hasta', params.hasta);
    return q;
  }


}
