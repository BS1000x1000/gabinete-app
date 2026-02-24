import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface Trabajador {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  rol: {
    id: string;
    nombreRol: string;
  };
  activo: boolean;
}

interface WrappedResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class TrabajadorService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/trabajadores`;

  trabajadores = signal<Trabajador[]>([]);

  /**
   * Obtener todos los trabajadores activos
   */
  getTrabajadores() {
    return this.http
      .get<WrappedResponse<Trabajador[]>>(`${this.api}`)
      .pipe(
        tap((res) => {
          this.trabajadores.set(res.data || []);
          console.log('✅ Trabajadores cargados:', res.data.length);
        }),
        catchError((err) => {
          console.error('❌ Error al cargar trabajadores:', err);
          return of({ success: false, data: [], timestamp: new Date().toISOString() });
        }),
      );
  }
}