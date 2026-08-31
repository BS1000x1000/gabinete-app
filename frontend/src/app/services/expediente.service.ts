import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { triggerDownload } from '../shared/utils/download.utils';
import { environment } from '../../environments/environment.development';
import {
  CategoriaDocumento,
  EstadoFirmaDocumento,
  OrigenDocumento,
} from '../interface/documentos.interface';

interface WrappedResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

/** Una de las tres filas fijas del expediente inicial. */
export interface FilaExpediente {
  categoria: CategoriaDocumento;
  nombre: string;
  /** false mientras la plantilla siga pendiente de dictamen legal. */
  plantillaValidada: boolean;
  motivoNoValidada: string | null;
  documentoId: string | null;
  estadoFirma: EstadoFirmaDocumento | null;
  origen: OrigenDocumento | null;
  plantillaVersion: string | null;
  fechaEnvio: string | null;
  actualizadoEn: string | null;
  puedeEnviar: boolean;
}

export interface EstadoExpediente {
  contratoId: string | null;
  puedeGenerar: boolean;
  /** Datos que saldrían en blanco en los documentos, en lenguaje llano. */
  faltantes: string[];
  documentos: FilaExpediente[];
}

export interface ResultadoGeneracion {
  generados: number;
  omitidos: number;
  faltantes: string[];
}

@Injectable({ providedIn: 'root' })
export class ExpedienteService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/expediente`;

  estado = signal<EstadoExpediente | null>(null);
  cargando = signal(false);
  generando = signal(false);

  cargar(clienteId: string): Observable<EstadoExpediente> {
    this.cargando.set(true);
    return this.http
      .get<WrappedResponse<EstadoExpediente>>(`${this.api}/cliente/${clienteId}`)
      .pipe(
        map(res => res.data ?? (res as any)),
        tap({
          next: e => {
            this.estado.set(e);
            this.cargando.set(false);
          },
          error: () => this.cargando.set(false),
        }),
      );
  }

  generar(contratoId: string): Observable<ResultadoGeneracion> {
    this.generando.set(true);
    return this.http
      .post<WrappedResponse<ResultadoGeneracion>>(
        `${this.api}/contrato/${contratoId}/generar`,
        {},
      )
      .pipe(
        map(res => res.data ?? (res as any)),
        tap({
          next: () => this.generando.set(false),
          error: () => this.generando.set(false),
        }),
      );
  }

  /**
   * Descarga el PDF generado al vuelo, sin guardarlo en el expediente.
   *
   * Es la vía para ver cómo va a quedar antes de generar de verdad, y la única
   * que funciona en local, donde no hay Object Storage configurado.
   */
  descargarVistaPrevia(
    contratoId: string,
    categoria: CategoriaDocumento,
    nombreFichero: string,
  ): Observable<void> {
    return this.http
      .get(`${this.api}/contrato/${contratoId}/vista-previa/${categoria}`, {
        responseType: 'blob',
      })
      .pipe(
        tap(blob => triggerDownload(blob, nombreFichero)),
        map(() => void 0),
      );
  }

  marcarEnviado(documentoId: string): Observable<unknown> {
    return this.http
      .post<WrappedResponse<unknown>>(`${this.api}/documento/${documentoId}/enviado`, {})
      .pipe(map(res => res.data ?? (res as any)));
  }

  subirFirmado(documentoId: string, fichero: File): Observable<unknown> {
    const form = new FormData();
    form.append('fichero', fichero);
    return this.http
      .post<WrappedResponse<unknown>>(
        `${this.api}/documento/${documentoId}/firmado`,
        form,
      )
      .pipe(map(res => res.data ?? (res as any)));
  }
}
