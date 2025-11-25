import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/* alumno.service.ts */
@Injectable({ providedIn: 'root' })
export class ListadoService {
  private http = inject(HttpClient);
  getById(id: number): Observable<any> {
    return this.http.get<any>(`/api/alumnos/${id}`);
  }
  update(id: number, cambios: Partial<any>) {
    return this.http.patch<any>(`/api/alumnos/${id}`, cambios);
  }
}
