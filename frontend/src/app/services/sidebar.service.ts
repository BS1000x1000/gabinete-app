import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class SidebarService {
  collapsed = signal(false);
  isLarge = signal(window.innerWidth >= 992);
  search = signal('');                 // <-- signal reactivo
  toggle() { this.collapsed.update(v => !v); }
}