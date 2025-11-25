import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class HeaderService {
  searchOpen = signal(false);
  notifications = signal(10);          // tus “anuncios”
}