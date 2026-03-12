import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Informe, CreateInformeDto, UpdateInformeDto } from '../interface/informes.interface';
import { triggerDownload } from '../shared/utils/download.utils';


interface WrappedResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class InformesService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/informes`;

  // Signals
  informes = signal<Informe[]>([]);
  informeActivo = signal<Informe | null>(null);
  cargando = signal(false);

  // ============================================================
  // LISTAR
  // ============================================================

  getAll(): Observable<Informe[]> {
    return this.http
      .get<WrappedResponse<Informe[]>>(this.api)
      .pipe(map((res: any) => res?.data ?? res));
  }

  getInformesByCliente(clienteId: string): Observable<Informe[]> {
    this.cargando.set(true);
    return this.http
      .get<WrappedResponse<Informe[]>>(`${this.api}/cliente/${clienteId}`)
      .pipe(
        map((res) => res.data || res),
        tap({
          next: (informes) => {
            this.informes.set(informes);
            this.cargando.set(false);
          },
          error: () => this.cargando.set(false),
        }),
      );
  }

  getById(id: string): Observable<Informe> {
    return this.http
      .get<WrappedResponse<Informe>>(`${this.api}/${id}`)
      .pipe(
        map((res) => res.data || res),
        tap((informe) => this.informeActivo.set(informe)),
      );
  }

  // ============================================================
  // CREAR
  // ============================================================

  create(dto: CreateInformeDto): Observable<Informe> {
    return this.http
      .post<WrappedResponse<Informe>>(this.api, dto)
      .pipe(
        map((res) => res.data || res),
        tap((nuevo) => {
          this.informes.update((prev) => [nuevo, ...prev]);
          this.informeActivo.set(nuevo);
        }),
      );
  }

  // ============================================================
  // ACTUALIZAR (autoguardado por sección)
  // ============================================================

  update(id: string, dto: UpdateInformeDto): Observable<Informe> {
    return this.http
      .patch<WrappedResponse<Informe>>(`${this.api}/${id}`, dto)
      .pipe(
        map((res) => res.data || res),
        tap((actualizado) => {
          this.informeActivo.set(actualizado);
          this.informes.update((prev) =>
            prev.map((i) => (i.id === id ? actualizado : i)),
          );
        }),
      );
  }

  // ============================================================
  // FINALIZAR
  // ============================================================

  finalizar(id: string): Observable<Informe> {
    return this.http
      .patch<WrappedResponse<Informe>>(`${this.api}/${id}/finalizar`, {})
      .pipe(
        map((res) => res.data || res),
        tap((finalizado) => {
          this.informeActivo.set(finalizado);
          this.informes.update((prev) =>
            prev.map((i) => (i.id === id ? finalizado : i)),
          );
        }),
      );
  }

  // ============================================================
  // ELIMINAR
  // ============================================================

  descargarPdf(informeId: string, titulo: string): Observable<void> {
    return this.http
      .get(`${this.api}/${informeId}/pdf`, { responseType: 'blob' })
      .pipe(
        tap((blob) => triggerDownload(blob, `${titulo.replace(/[^a-z0-9]/gi, '_')}.pdf`)),
        map(() => void 0),
      );
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http
      .delete<WrappedResponse<{ message: string }>>(`${this.api}/${id}`)
      .pipe(
        map((res) => res.data || res),
        tap(() => {
          this.informes.update((prev) => prev.filter((i) => i.id !== id));
          if (this.informeActivo()?.id === id) {
            this.informeActivo.set(null);
          }
        }),
      );
  }
}