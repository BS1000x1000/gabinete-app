import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { triggerDownload } from '../shared/utils/download.utils';
import {
  ContratoServicio,
  CreateContratoPayload,
  UpdateContratoPayload,
} from '../interface/contrato.interface';

interface WrappedResponse<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class ContratosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/contratos`;

  private _contratosCliente = signal<ContratoServicio[]>([]);
  readonly contratosCliente = this._contratosCliente.asReadonly();

  loadContratosCliente(clienteId: string) {
    return this.http
      .get<WrappedResponse<ContratoServicio[]>>(`${this.apiUrl}/cliente/${clienteId}`)
      .pipe(
        map(res => (res.data ?? res) as ContratoServicio[]),
        tap(contratos => this._contratosCliente.set(contratos)),
      );
  }

  getContratos() {
    return this.http
      .get<WrappedResponse<ContratoServicio[]>>(this.apiUrl)
      .pipe(map(res => (res.data ?? res) as ContratoServicio[]));
  }

  getContrato(id: string) {
    return this.http
      .get<WrappedResponse<ContratoServicio>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => (res.data ?? res) as ContratoServicio));
  }

  crear(payload: CreateContratoPayload) {
    return this.http
      .post<WrappedResponse<ContratoServicio>>(this.apiUrl, payload)
      .pipe(map(res => (res.data ?? res) as ContratoServicio));
  }

  actualizar(id: string, payload: UpdateContratoPayload) {
    return this.http
      .patch<WrappedResponse<ContratoServicio>>(`${this.apiUrl}/${id}`, payload)
      .pipe(map(res => (res.data ?? res) as ContratoServicio));
  }

  finalizar(id: string) {
    return this.http
      .patch<WrappedResponse<ContratoServicio>>(`${this.apiUrl}/${id}/finalizar`, {})
      .pipe(map(res => (res.data ?? res) as ContratoServicio));
  }

  /**
   * Sube el contrato firmado. El navegador pone el Content-Type con su boundary;
   * el interceptor no lo toca.
   */
  subirDocumento(id: string, fichero: File) {
    const form = new FormData();
    form.append('fichero', fichero, fichero.name);
    return this.http
      .post<WrappedResponse<ContratoServicio>>(`${this.apiUrl}/${id}/documento`, form)
      .pipe(
        map(res => (res.data ?? res) as ContratoServicio),
        tap(actualizado =>
          this._contratosCliente.update(list =>
            list.map(c => (c.id === actualizado.id ? actualizado : c)),
          ),
        ),
      );
  }

  descargarPdf(id: string): Observable<void> {
    return this.http
      .get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' })
      .pipe(map(blob => triggerDownload(blob, `contrato-${id}.pdf`)));
  }

  clearContratosCliente() {
    this._contratosCliente.set([]);
  }
}
