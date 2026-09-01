import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import {
  Factura,
  MarcarPagadaPayload,
  PreviewGeneracion,
  ResultadoGeneracion,
  ResumenPack,
  SeleccionPack,
  EnvioGestoria,
  PeriodoPendiente,
  PreviewEnvioGestoria,
} from '../interface/factura.interface';
import { triggerDownload } from '../shared/utils/download.utils';

interface WrappedResponse<T> { data: T }

@Injectable({ providedIn: 'root' })
export class FacturasService {
  private http   = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/facturas`;

  private unwrap<T>(res: WrappedResponse<T> | T): T {
    return (res as WrappedResponse<T>).data ?? (res as T);
  }

  /**
   * `soloMias` lo mandan las pantallas "Mis...": el ADMIN tambien es un autonomo
   * con su propio circuito fiscal y sus numeros no deben mezclarse con los de
   * los demas. La unica pantalla que llama sin el flag es Supervision.
   */
  getFacturas(filters?: {
    anio?: number;
    mes?: number;
    clienteId?: string;
    estado?: string;
    soloMias?: boolean;
  }) {
    let params = new HttpParams();
    if (filters?.anio)      params = params.set('anio',      filters.anio);
    if (filters?.mes)       params = params.set('mes',       filters.mes);
    if (filters?.clienteId) params = params.set('clienteId', filters.clienteId);
    if (filters?.estado)    params = params.set('estado',    filters.estado);
    if (filters?.soloMias)  params = params.set('soloMias',  'true');
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

  /**
   * Que se generaria en ese periodo, sin escribir nada. El boton de generar era
   * ciego: no se sabia cuantas facturas ni por cuanto importe hasta despues.
   */
  previsualizarGeneracion(anio: number, mes: number, soloMias = true) {
    return this.http
      .post<WrappedResponse<PreviewGeneracion>>(`${this.apiUrl}/generar-mes/preview`, {
        anio,
        mes,
        soloMias,
      })
      .pipe(map(res => this.unwrap(res)));
  }

  /**
   * @param soloMias  Un terapeuta genera siempre las suyas (el backend se lo
   *   impone); el ADMIN elige entre las suyas y las de todo el gabinete.
   */
  generarMes(anio: number, mes: number, soloMias = true) {
    return this.http
      .post<WrappedResponse<ResultadoGeneracion>>(`${this.apiUrl}/generar-mes`, {
        anio,
        mes,
        soloMias,
      })
      .pipe(map(res => this.unwrap(res)));
  }

  /** Que llevaria el paquete, para enseñarlo antes de descargar o enviar. */
  resumenPack(seleccion: SeleccionPack) {
    return this.http
      .get<WrappedResponse<ResumenPack>>(`${this.apiUrl}/pack/resumen`, {
        params: this.paramsPack(seleccion),
      })
      .pipe(map(res => this.unwrap(res)));
  }

  /**
   * Descarga el paquete. El nombre del fichero lo decide el backend (lleva el NIF
   * y el periodo), asi que se lee del `Content-Disposition` en vez de inventarlo
   * aqui; y `X-Pack-Incidencias` dice cuantas facturas se quedaron sin PDF, algo
   * que no se puede saber mirando el zip desde el navegador.
   */
  descargarPack(seleccion: SeleccionPack): Observable<{ incidencias: number }> {
    return this.http
      .get(`${this.apiUrl}/pack`, {
        params: this.paramsPack(seleccion),
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map(res => {
          const blob = res.body as Blob;
          triggerDownload(blob, this.nombreDeLaRespuesta(res, seleccion));
          return { incidencias: Number(res.headers.get('X-Pack-Incidencias') ?? 0) };
        }),
      );
  }

  // ── Entrega a la gestoría ────────────────────────────────────────────────

  /** Periodos ya cerrados cuyas facturas no han salido nunca. */
  pendientesGestoria() {
    return this.http
      .get<WrappedResponse<PeriodoPendiente[]>>(`${this.apiUrl}/gestoria/pendientes`)
      .pipe(map(res => this.unwrap(res)));
  }

  historialGestoria() {
    return this.http
      .get<WrappedResponse<EnvioGestoria[]>>(`${this.apiUrl}/gestoria/historial`)
      .pipe(map(res => this.unwrap(res)));
  }

  /** Qué se mandaría y a quién. Se enseña antes de enviar nada. */
  previewGestoria(seleccion: SeleccionPack) {
    return this.http
      .get<WrappedResponse<PreviewEnvioGestoria>>(`${this.apiUrl}/gestoria/preview`, {
        params: this.paramsPack(seleccion),
      })
      .pipe(map(res => this.unwrap(res)));
  }

  enviarAGestoria(seleccion: SeleccionPack) {
    return this.http
      .post<WrappedResponse<{ envio: EnvioGestoria; incidencias: unknown[] }>>(
        `${this.apiUrl}/gestoria/enviar`,
        seleccion,
      )
      .pipe(map(res => this.unwrap(res)));
  }

  private paramsPack(seleccion: SeleccionPack): HttpParams {
    let params = new HttpParams();
    if (seleccion.ids?.length) {
      for (const id of seleccion.ids) params = params.append('ids', id);
    } else {
      params = params
        .set('periodoDesde', seleccion.periodoDesde!)
        .set('periodoHasta', seleccion.periodoHasta!);
    }
    if (seleccion.formato) params = params.set('formato', seleccion.formato);
    return params;
  }

  private nombreDeLaRespuesta(
    res: HttpResponse<Blob>,
    seleccion: SeleccionPack,
  ): string {
    const cabecera = res.headers.get('Content-Disposition') ?? '';
    const match = /filename="?([^";]+)"?/i.exec(cabecera);
    if (match) return match[1];
    const ext = seleccion.formato === 'excel' ? 'xlsx' : 'zip';
    return `facturas.${ext}`;
  }
}
