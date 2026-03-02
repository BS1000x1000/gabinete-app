import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map, catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Notificacion } from '../interface/notificacion.interface';

interface WrappedResponse<T> { data: T }

@Injectable({ providedIn: 'root' })
export class NotificacionesService implements OnDestroy {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/notificaciones`;

  private _notificaciones = signal<Notificacion[]>([]);
  private _pollingInterval: ReturnType<typeof setInterval> | null = null;

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

  /** Inicia polling del contador cada 5 minutos */
  iniciarPolling() {
    if (this._pollingInterval) return;
    this._pollingInterval = setInterval(() => {
      this.http
        .get<number | WrappedResponse<number>>(`${this.api}/count`)
        .pipe(
          map((res: any) => (typeof res === 'number' ? res : res?.data ?? 0)),
          catchError(() => EMPTY),
        )
        .subscribe((count) => {
          // Si el count es distinto a las no leídas actuales, recargamos
          if (count !== this.contadorNoLeidas()) {
            this.cargar().subscribe();
          }
        });
    }, 5 * 60 * 1000);
  }

  detenerPolling() {
    if (this._pollingInterval) {
      clearInterval(this._pollingInterval);
      this._pollingInterval = null;
    }
  }

  ngOnDestroy() {
    this.detenerPolling();
  }
}
