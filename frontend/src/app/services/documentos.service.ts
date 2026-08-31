import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';
import {
  DocumentoCliente,
  CreateDocumentoPayload,
  UpdateDocumentoPayload,
} from '../interface/documentos.interface';

interface WrappedResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentosService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/documentos`;

  documentos = signal<DocumentoCliente[]>([]);
  cargando = signal(false);

  getByCliente(clienteId: string): Observable<DocumentoCliente[]> {
    this.cargando.set(true);
    return this.http
      .get<WrappedResponse<DocumentoCliente[]>>(`${this.api}/cliente/${clienteId}`)
      .pipe(
        map((res) => res.data ?? (res as any)),
        tap({
          next: (docs) => {
            this.documentos.set(docs);
            this.cargando.set(false);
          },
          error: () => this.cargando.set(false),
        }),
      );
  }

  /** Subida multipart. El interceptor no debe fijar Content-Type: lo pone el navegador con el boundary. */
  subir(fichero: File, payload: CreateDocumentoPayload): Observable<DocumentoCliente> {
    const form = new FormData();
    form.append('fichero', fichero, fichero.name);
    form.append('clienteId', payload.clienteId);
    form.append('categoria', payload.categoria);
    if (payload.nombre) form.append('nombre', payload.nombre);
    if (payload.descripcion) form.append('descripcion', payload.descripcion);
    if (payload.fechaDocumento) form.append('fechaDocumento', payload.fechaDocumento);

    return this.http.post<WrappedResponse<DocumentoCliente>>(this.api, form).pipe(
      map((res) => res.data ?? (res as any)),
      tap((doc) => this.documentos.update((d) => [doc, ...d])),
    );
  }

  actualizar(id: string, payload: UpdateDocumentoPayload): Observable<DocumentoCliente> {
    return this.http
      .patch<WrappedResponse<DocumentoCliente>>(`${this.api}/${id}`, payload)
      .pipe(
        map((res) => res.data ?? (res as any)),
        tap((doc) =>
          this.documentos.update((d) => d.map((x) => (x.id === doc.id ? doc : x))),
        ),
      );
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<WrappedResponse<unknown>>(`${this.api}/${id}`).pipe(
      map(() => void 0),
      tap(() => this.documentos.update((d) => d.filter((x) => x.id !== id))),
    );
  }

  /**
   * Abre el documento en una pestaña nueva mediante URL prefirmada (5 min).
   * El binario va directo desde Object Storage al navegador, sin pasar por la API.
   */
  abrir(id: string): Observable<void> {
    return this.http
      .get<WrappedResponse<{ url: string; nombre: string }>>(`${this.api}/${id}/descarga`)
      .pipe(
        map((res) => res.data ?? (res as any)),
        tap((d) => window.open(d.url, '_blank', 'noopener,noreferrer')),
        map(() => void 0),
      );
  }
}
