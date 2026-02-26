import { Injectable, signal } from '@angular/core';

export type DrawerSection = 'personal' | 'sanitario' | 'contactos' | 'colegio';

export interface DrawerState {
  isOpen: boolean;
  section: DrawerSection | null;
  clienteId: string | null;
}

@Injectable({ providedIn: 'root' })
export class DrawerService {
  private _state = signal<DrawerState>({
    isOpen: false,
    section: null,
    clienteId: null,
  });

  readonly state = this._state.asReadonly();

  open(section: DrawerSection, clienteId: string): void {
    this._state.set({ isOpen: true, section, clienteId });
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this._state.set({ isOpen: false, section: null, clienteId: null });
    document.body.style.overflow = '';
  }

  toggle(section: DrawerSection, clienteId: string): void {
    const current = this._state();
    if (current.isOpen && current.section === section) {
      this.close();
    } else {
      this.open(section, clienteId);
    }
  }
}