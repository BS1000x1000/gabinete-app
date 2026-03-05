import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SesionesFiltrosService {
  private _clienteId = signal<string>('');

  readonly filtroEstado = signal<string>('TODAS');
  readonly filtroMes = signal<string>('');

  /**
   * Llama en ngOnInit del tab con el clienteId actual.
   * Resetea filtros solo si cambió de cliente.
   */
  inicializar(clienteId: string): void {
    if (this._clienteId() !== clienteId) {
      this._clienteId.set(clienteId);
      this._reset();
    }
  }

  resetear(): void {
    this._reset();
  }

  private _reset(): void {
    this.filtroEstado.set('TODAS');
    this.filtroMes.set('');
  }
}
