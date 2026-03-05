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
  username?: string;
  telefono?: string;
  fechaContratacion?: string;
  rol: {
    id: string;
    nombreRol: string;
    codigo?: string;
  };
  activo: boolean;
}

export interface Rol {
  id: string;
  nombreRol: string;
  codigo: string;
  descripcion?: string;
}

export interface CreateTrabajadorPayload {
  username: string;
  password: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  rolId: string;
}

export interface UpdateTrabajadorPayload {
  nombre?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  rolId?: string;
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
  private rolesApi = `${environment.apiUrl}/roles`;

  trabajadores = signal<Trabajador[]>([]);

  getTrabajadores(incluirInactivos = false) {
    const params = incluirInactivos ? '?incluirInactivos=true' : '';
    return this.http
      .get<WrappedResponse<Trabajador[]>>(`${this.api}${params}`)
      .pipe(
        tap((res) => {
          this.trabajadores.set(res.data || []);
        }),
        catchError((err) => {
          console.error('Error al cargar trabajadores:', err);
          return of({ success: false, data: [], timestamp: new Date().toISOString() });
        }),
      );
  }

  getRoles() {
    return this.http.get<WrappedResponse<Rol[]>>(this.rolesApi).pipe(
      catchError((err) => {
        console.error('Error al cargar roles:', err);
        return of({ success: false, data: [], timestamp: new Date().toISOString() });
      }),
    );
  }

  createTrabajador(payload: CreateTrabajadorPayload) {
    return this.http.post<WrappedResponse<Trabajador>>(this.api, payload);
  }

  updateTrabajador(id: string, payload: UpdateTrabajadorPayload) {
    return this.http.patch<WrappedResponse<Trabajador>>(`${this.api}/${id}`, payload);
  }

  desactivarTrabajador(id: string) {
    return this.http.delete<WrappedResponse<any>>(`${this.api}/${id}`);
  }

  reactivarTrabajador(id: string) {
    return this.http.patch<WrappedResponse<Trabajador>>(`${this.api}/${id}/reactivar`, {});
  }
}
