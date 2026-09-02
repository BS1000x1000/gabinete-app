import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { triggerDownload } from '../shared/utils/download.utils';
import {
  ContratoServicio,
  CreateContratoPayload,
  UpdateContratoPayload,
  SlotPayload,
  PreviewReplanificacion,
  CargaSemanalDia,
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

  /**
   * `soloMias` lo manda "Mis contratos": el ADMIN tambien es un autonomo y sus
   * contratos son los suyos. La vista global del gabinete es Supervision.
   */
  getContratos(soloMias = false) {
    const params = soloMias ? new HttpParams().set('soloMias', 'true') : undefined;
    return this.http
      .get<WrappedResponse<ContratoServicio[]>>(this.apiUrl, { params })
      .pipe(map(res => (res.data ?? res) as ContratoServicio[]));
  }

  /**
   * Qué clientes tiene un terapeuta cada día de la semana. Alimenta la rejilla
   * de "Mi semana". Sin `trabajadorId` el backend devuelve la del que llama;
   * la ajena solo la ve un ADMIN.
   */
  getCargaSemanal(trabajadorId?: string) {
    const params = trabajadorId
      ? new HttpParams().set('trabajadorId', trabajadorId)
      : undefined;
    return this.http
      .get<WrappedResponse<CargaSemanalDia[]>>(`${this.apiUrl}/carga-semanal`, { params })
      .pipe(map(res => (res.data ?? res) as CargaSemanalDia[]));
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
   * Calcula qué le pasaría a las sesiones futuras con el horario nuevo.
   * No escribe nada: es lo que se enseña antes de confirmar.
   */
  previewReplanificar(id: string, slots: SlotPayload[]) {
    return this.http
      .post<WrappedResponse<PreviewReplanificacion>>(
        `${this.apiUrl}/${id}/replanificar/preview`,
        { slots },
      )
      .pipe(map(res => (res.data ?? res) as PreviewReplanificacion));
  }

  /**
   * Aplica la replanificación. El `hash` es el del plan que vio el usuario: si la
   * agenda cambió por debajo, el backend lo rechaza en vez de aplicar otra cosa.
   */
  replanificar(id: string, slots: SlotPayload[], hashPrevisualizacion: string) {
    return this.http
      .post<WrappedResponse<{ aplicado: PreviewReplanificacion['resumen'] }>>(
        `${this.apiUrl}/${id}/replanificar`,
        { slots, hashPrevisualizacion },
      )
      .pipe(map(res => (res.data ?? res) as { aplicado: PreviewReplanificacion['resumen'] }));
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
