import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Factura, MarcarPagadaPayload } from '../interface/factura.interface';

@Injectable({ providedIn: 'root' })
export class FacturasService {
  private http   = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/facturas`;

  getFacturas(filters?: { anio?: number; mes?: number; clienteId?: string; estado?: string }) {
    let params = new HttpParams();
    if (filters?.anio)      params = params.set('anio',      filters.anio);
    if (filters?.mes)       params = params.set('mes',       filters.mes);
    if (filters?.clienteId) params = params.set('clienteId', filters.clienteId);
    if (filters?.estado)    params = params.set('estado',    filters.estado);
    return this.http.get<Factura[]>(this.apiUrl, { params });
  }

  getFactura(id: string) {
    return this.http.get<Factura>(`${this.apiUrl}/${id}`);
  }

  getPdfUrl(id: string) {
    return this.http.get<{ url: string }>(`${this.apiUrl}/${id}/pdf`);
  }

  marcarPagada(id: string, payload: MarcarPagadaPayload) {
    return this.http.patch<Factura>(`${this.apiUrl}/${id}/marcar-pagada`, payload);
  }

  anular(id: string) {
    return this.http.patch<Factura>(`${this.apiUrl}/${id}/anular`, {});
  }

  reenviarEmail(id: string) {
    return this.http.post<{ enviado: boolean }>(`${this.apiUrl}/${id}/reenviar`, {});
  }

  regenerarPdf(id: string) {
    return this.http.post<{ ok: boolean }>(`${this.apiUrl}/${id}/regenerar-pdf`, {});
  }

  generarMes(anio: number, mes: number) {
    return this.http.post<{ creadas: number }>(`${this.apiUrl}/generar-mes`, { anio, mes });
  }
}
