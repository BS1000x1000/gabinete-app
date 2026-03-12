import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map, catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Notificacion } from '../interface/notificacion.interface';

interface WrappedResponse<T> { data: T }

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/notificaciones`;

  private _notificaciones = signal<Notificacion[]>([]);
  private _eventSource: EventSource | null = null;

  readonly notificaciones = this._notificaciones.asReadonly();
  readonly noLeidas = computed(() => this._notificaciones().filter((n) => !n.leida && !n.descartada));
  readonly contadorNoLeidas = computed(() => this.noLeidas().length);

  cargar() {
    return this.http.get<Notificacion[] | WrappedResponse<Notificacion[]>>(this.api).pipe(
      map((res: any) => (res?.data !== undefined ? res.data : res) as Notificacion[]),
      tap((notifs) => this._notificaciones.set(notifs)),
      catchError(() => EMPTY),
    );
  }

  marcarLeida(id: string) {
    return this.http.patch<Notificacion | WrappedResponse<Notificacion>>(`${this.api}/${id}/leer`, {}).pipe(
      map((res: any) => (res?.data !== undefined ? res.data : res) as Notificacion),
      tap((actualizada) =>
        this._notificaciones.update((ns) =>
          ns.map((n) => (n.id === actualizada.id ? actualizada : n)),
        ),
      ),
    );
  }

  marcarTodasLeidas() {
    return this.http.patch(`${this.api}/leer-todas`, {}).pipe(
      tap(() =>
        this._notificaciones.update((ns) =>
          ns.map((n) => ({ ...n, leida: true })),
        ),
      ),
    );
  }

  descartar(id: string) {
    return this.http.patch(`${this.api}/${id}/descartar`, {}).pipe(
      tap(() =>
        this._notificaciones.update((ns) => ns.filter((n) => n.id !== id)),
      ),
    );
  }

  evaluar() {
    return this.http.post<Notificacion[] | WrappedResponse<Notificacion[]>>(`${this.api}/evaluar`, {}).pipe(
      map((res: any) => (res?.data !== undefined ? res.data : res) as Notificacion[]),
      tap((notifs) => this._notificaciones.set(notifs)),
      catchError(() => EMPTY),
    );
  }

  conectarSSE(token: string) {
    if (this._eventSource) return;

    const url = `${this.api}/stream?token=${encodeURIComponent(token)}`;
    this._eventSource = new EventSource(url);

    this._eventSource.onmessage = (event) => {
      const notif: Notificacion = JSON.parse(event.data);
      this._notificaciones.update((list) => {
        if (list.some((n) => n.id === notif.id)) return list;
        return [notif, ...list];
      });
    };

    this._eventSource.onerror = () => {
      // Si la conexión se cerró definitivamente (no es un reintento automático),
      // limpiamos la referencia para permitir reconexión manual via conectarSSE().
      if (this._eventSource?.readyState === EventSource.CLOSED) {
        this._eventSource = null;
      }
    };
  }

  desconectarSSE() {
    this._eventSource?.close();
    this._eventSource = null;
  }
}
