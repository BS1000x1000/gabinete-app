import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Factura, MarcarPagadaPayload } from '../interface/factura.interface';
import { triggerDownload } from '../shared/utils/download.utils';

interface WrappedResponse<T> { data: T }

@Injectable({ providedIn: 'root' })
export class FacturasService {
  private http   = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/facturas`;

  private unwrap<T>(res: WrappedResponse<T> | T): T {
    return (res as WrappedResponse<T>).data ?? (res as T);
  }

  getFacturas(filters?: { anio?: number; mes?: number; clienteId?: string; estado?: string }) {
    let params = new HttpParams();
    if (filters?.anio)      params = params.set('anio',      filters.anio);
    if (filters?.mes)       params = params.set('mes',       filters.mes);
    if (filters?.clienteId) params = params.set('clienteId', filters.clienteId);
    if (filters?.estado)    params = params.set('estado',    filters.estado);
    return this.http.get<WrappedResponse<Factura[]>>(this.apiUrl, { params })
      .pipe(map(res => this.unwrap(res)));
  }

  getFactura(id: string) {
    return this.http.get<WrappedResponse<Factura>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => this.unwrap(res)));
  }

  descargarPdf(id: string): Observable<void> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' })
      .pipe(map(blob => triggerDownload(blob, `factura-${id}.pdf`)));
  }

  marcarPagada(id: string, payload: MarcarPagadaPayload) {
    return this.http.patch<WrappedResponse<Factura>>(`${this.apiUrl}/${id}/marcar-pagada`, payload)
      .pipe(map(res => this.unwrap(res)));
  }

  anular(id: string) {
    return this.http.patch<WrappedResponse<Factura>>(`${this.apiUrl}/${id}/anular`, {})
      .pipe(map(res => this.unwrap(res)));
  }

  reenviarEmail(id: string) {
    return this.http.post<WrappedResponse<{ enviado: boolean }>>(`${this.apiUrl}/${id}/reenviar`, {})
      .pipe(map(res => this.unwrap(res)));
  }

  regenerarPdf(id: string) {
    return this.http.post<WrappedResponse<{ ok: boolean }>>(`${this.apiUrl}/${id}/regenerar-pdf`, {})
      .pipe(map(res => this.unwrap(res)));
  }

  generarMes(anio: number, mes: number) {
    return this.http.post<WrappedResponse<{ creadas: number }>>(`${this.apiUrl}/generar-mes`, { anio, mes })
      .pipe(map(res => this.unwrap(res)));
  }
}
