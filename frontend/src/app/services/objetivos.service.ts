import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import {
  AreaDesarrollo,
  ObjetivoGeneral,
} from '../interface/objetivo-general.interface';

// ✅ NUEVO: Interface para respuestas envueltas
interface WrappedResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class ObjetivosService {
  private http = inject(HttpClient);
  private readonly apiAreas = `${environment.apiUrl}/areas-desarrollo`;
  private readonly apiObjetivos = `${environment.apiUrl}/objetivos-generales`;

  // Estado reactivo
  areas = signal<AreaDesarrollo[]>([]);
  objetivosGenerales = signal<ObjetivoGeneral[]>([]);
  isLoading = signal(false);

  // ========================================
  // ÁREAS DE DESARROLLO
  // ========================================

  /**
   * Obtener todas las áreas de desarrollo
   */
  getAreas(incluirInactivas: boolean = false): Observable<AreaDesarrollo[]> {
    let params = new HttpParams();
    if (incluirInactivas) params = params.set('incluirInactivas', 'true');

    this.isLoading.set(true);
    return this.http
      .get<WrappedResponse<AreaDesarrollo[]>>(this.apiAreas, { params })
      .pipe(
        map((res) => res.data || res),
        tap({
          next: (areas) => {
            this.areas.set(areas);
            this.isLoading.set(false);
            console.log(`✅ ${areas.length} áreas de desarrollo cargadas`);
          },
          error: () => this.isLoading.set(false),
        })
      );
  }

  /**
   * Obtener un área por ID
   */
  getAreaById(id: string): Observable<AreaDesarrollo> {
    return this.http
      .get<WrappedResponse<AreaDesarrollo>>(`${this.apiAreas}/${id}`)
      .pipe(map((res) => res.data || res));
  }

  /**
   * Crear área de desarrollo
   */
  createArea(data: {
    nombre: string;
    descripcion?: string;
    color?: string;
    orden?: number;
  }): Observable<AreaDesarrollo> {
    return this.http
      .post<WrappedResponse<AreaDesarrollo>>(this.apiAreas, data)
      .pipe(
        map((res) => res.data || res),
        tap((nueva) => {
          this.areas.update((prev) => [...prev, nueva]);
          console.log('✅ Área creada:', nueva.nombre);
        })
      );
  }

  /**
   * Actualizar área de desarrollo
   */
  updateArea(
    id: string,
    data: Partial<AreaDesarrollo>
  ): Observable<AreaDesarrollo> {
    return this.http
      .patch<WrappedResponse<AreaDesarrollo>>(`${this.apiAreas}/${id}`, data)
      .pipe(
        map((res) => res.data || res),
        tap((actualizada) => {
          this.areas.update((prev) =>
            prev.map((a) => (a.id === id ? actualizada : a))
          );
          console.log('✅ Área actualizada:', id);
        })
      );
  }

  /**
   * Eliminar área de desarrollo
   */
  deleteArea(id: string): Observable<{ message: string }> {
    return this.http
      .delete<WrappedResponse<{ message: string }>>(`${this.apiAreas}/${id}`)
      .pipe(
        map((res) => res.data || res),
        tap(() => {
          this.areas.update((prev) => prev.filter((a) => a.id !== id));
          console.log('🗑️ Área eliminada:', id);
        })
      );
  }

  // ========================================
  // OBJETIVOS GENERALES
  // ========================================

  /**
   * Obtener todos los objetivos generales
   */
  getObjetivosGenerales(
    incluirInactivos: boolean = false
  ): Observable<ObjetivoGeneral[]> {
    let params = new HttpParams();
    if (incluirInactivos) params = params.set('incluirInactivos', 'true');

    this.isLoading.set(true);
    return this.http
      .get<WrappedResponse<ObjetivoGeneral[]>>(this.apiObjetivos, { params })
      .pipe(
        map((res) => res.data || res),
        tap({
          next: (objetivos) => {
            this.objetivosGenerales.set(objetivos);
            this.isLoading.set(false);
            console.log(`✅ ${objetivos.length} objetivos generales cargados`);
          },
          error: () => this.isLoading.set(false),
        })
      );
  }

  /**
   * Obtener objetivos de un área específica
   */
  getObjetivosByArea(areaId: string): Observable<ObjetivoGeneral[]> {
    return this.http
      .get<WrappedResponse<ObjetivoGeneral[]>>(`${this.apiObjetivos}/area/${areaId}`)
      .pipe(map((res) => res.data || res));
  }

  /**
   * Obtener un objetivo por ID
   */
  getObjetivoById(id: string): Observable<ObjetivoGeneral> {
    return this.http
      .get<WrappedResponse<ObjetivoGeneral>>(`${this.apiObjetivos}/${id}`)
      .pipe(map((res) => res.data || res));
  }

  /**
   * Crear objetivo general
   */
  createObjetivo(data: {
    titulo: string;
    descripcion?: string;
    areaDesarrolloId: string;
  }): Observable<ObjetivoGeneral> {
    return this.http
      .post<WrappedResponse<ObjetivoGeneral>>(this.apiObjetivos, data)
      .pipe(
        map((res) => res.data || res),
        tap((nuevo) => {
          this.objetivosGenerales.update((prev) => [...prev, nuevo]);
          console.log('✅ Objetivo creado:', nuevo.titulo);
        })
      );
  }

  /**
   * Actualizar objetivo general
   */
  updateObjetivo(
    id: string,
    data: Partial<ObjetivoGeneral>
  ): Observable<ObjetivoGeneral> {
    return this.http
      .patch<WrappedResponse<ObjetivoGeneral>>(`${this.apiObjetivos}/${id}`, data)
      .pipe(
        map((res) => res.data || res),
        tap((actualizado) => {
          this.objetivosGenerales.update((prev) =>
            prev.map((o) => (o.id === id ? actualizado : o))
          );
          console.log('✅ Objetivo actualizado:', id);
        })
      );
  }

  /**
   * Eliminar objetivo general
   */
  deleteObjetivo(id: string): Observable<{ message: string }> {
    return this.http
      .delete<WrappedResponse<{ message: string }>>(`${this.apiObjetivos}/${id}`)
      .pipe(
        map((res) => res.data || res),
        tap(() => {
          this.objetivosGenerales.update((prev) =>
            prev.filter((o) => o.id !== id)
          );
          console.log('🗑️ Objetivo eliminado:', id);
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
    this.areas.set([]);
    this.objetivosGenerales.set([]);
    this.isLoading.set(false);
  }
}