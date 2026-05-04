import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { 
  RegistroDiario, 
  CreateRegistroDiarioDto,
  UpdateRegistroDiarioDto 
} from '../interface/registro-diario.interface';
import { environment } from '../../environments/environment.development';

interface WrappedResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class RegistrosService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/registros`;

  // Estado reactivo de los registros del cliente actual
  registros = signal<RegistroDiario[]>([]);
  isLoading = signal(false);

  // ========================================
  // CRUD
  // ========================================

  /**
   * Obtener registros por cliente
   */
  getRegistrosByCliente(clienteId: string): Observable<RegistroDiario[]> {
    this.isLoading.set(true);
    return this.http
      .get<WrappedResponse<RegistroDiario[]>>(`${this.api}/cliente/${clienteId}`)
      .pipe(
        map((res) => res.data || res),
        tap({
          next: (res) => {
            this.registros.set(res);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false)
        })
      );
  }

  /**
   * Obtener registros del trabajador autenticado
   */
  getMisRegistros(): Observable<RegistroDiario[]> {
    return this.http
      .get<WrappedResponse<RegistroDiario[]>>(`${this.api}/mis-registros`)
      .pipe(map((res) => res.data || res));
  }

  /**
   * Obtener un registro por ID
   */
  getRegistroById(id: string): Observable<RegistroDiario> {
    return this.http
      .get<WrappedResponse<RegistroDiario>>(`${this.api}/${id}`)
      .pipe(map((res) => res.data || res));
  }

  /**
   * Crear nuevo registro
   * ✅ ACTUALIZADO: Ahora soporta objetivos generales trabajados
   */
  createRegistro(dto: CreateRegistroDiarioDto): Observable<RegistroDiario> {
    return this.http
      .post<WrappedResponse<RegistroDiario>>(this.api, dto)
      .pipe(
        map((res) => res.data || res),
        tap((nuevo) => {
          this.registros.update((prev) => [nuevo, ...prev]);
        })
      );
  }

  /**
   * Actualizar un registro
   * ✅ ACTUALIZADO: Ahora soporta actualizar objetivos trabajados
   */
  updateRegistro(id: string, dto: UpdateRegistroDiarioDto): Observable<RegistroDiario> {
    return this.http
      .patch<WrappedResponse<RegistroDiario>>(`${this.api}/${id}`, dto)
      .pipe(
        map((res) => res.data || res),
        tap((actualizado) => {
          this.registros.update((prev) =>
            prev.map((r) => (r.id === id ? actualizado : r))
          );
        })
      );
  }

  /**
   * Eliminar un registro
   */
  deleteRegistro(id: string): Observable<{ message: string; id: string }> {
    return this.http
      .delete<WrappedResponse<{ message: string; id: string }>>(`${this.api}/${id}`)
      .pipe(
        map((res) => res.data || res),
        tap(() => {
          this.registros.update((prev) => prev.filter((r) => r.id !== id));
        })
      );
  }

  // ========================================
  // HELPERS
  // ========================================

  /**
   * Limpiar estado
   */
  clearState() {
    this.registros.set([]);
    this.isLoading.set(false);
  }
}