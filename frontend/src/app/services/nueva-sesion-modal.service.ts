import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NuevaSesionModalService {
  private _isOpen = signal(false);
  readonly isOpen = this._isOpen.asReadonly();

  /**
   * Cliente con el que abrir el modal ya relleno. Lo usa la pestaña Sesiones de
   * la ficha: ahí ya sabemos de quién es la sesión y volver a elegirlo sobra.
   */
  private _clientePreseleccionado = signal<string | null>(null);
  readonly clientePreseleccionado = this._clientePreseleccionado.asReadonly();

  open(clienteId?: string): void {
    this._clientePreseleccionado.set(clienteId ?? null);
    this._isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this._isOpen.set(false);
    this._clientePreseleccionado.set(null);
    document.body.style.overflow = '';
  }
}
