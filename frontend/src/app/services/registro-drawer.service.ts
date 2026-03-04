import { Injectable, signal } from '@angular/core';

export interface RegistroDrawerContext {
  isOpen: boolean;
  clienteId: string | null;
  clienteNombre: string | null;
  sesionId: string | null; // cuando viene de "Completar sesión"
}

@Injectable({ providedIn: 'root' })
export class RegistroDrawerService {
  private _state = signal<RegistroDrawerContext>({
    isOpen: false,
    clienteId: null,
    clienteNombre: null,
    sesionId: null,
  });

  readonly state = this._state.asReadonly();

  /** Abre el drawer con contexto completo (desde tarjeta de sesión) */
  openConContexto(clienteId: string, clienteNombre: string, sesionId?: string): void {
    this._state.set({
      isOpen: true,
      clienteId,
      clienteNombre,
      sesionId: sesionId ?? null,
    });
    document.body.style.overflow = 'hidden';
  }

  /** Abre el drawer sin cliente preseleccionado (desde sidebar o búsqueda) */
  openVacio(): void {
    this._state.set({
      isOpen: true,
      clienteId: null,
      clienteNombre: null,
      sesionId: null,
    });
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this._state.set({ isOpen: false, clienteId: null, clienteNombre: null, sesionId: null });
    document.body.style.overflow = '';
  }
}
