import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NuevaSesionModalService {
  private _isOpen = signal(false);
  readonly isOpen = this._isOpen.asReadonly();

  open(): void {
    this._isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this._isOpen.set(false);
    document.body.style.overflow = '';
  }
}
