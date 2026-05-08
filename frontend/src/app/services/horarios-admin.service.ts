import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import {
  HorarioAdmin,
  CreateHorarioAdminDto,
  UpdateHorarioAdminDto,
} from '../interface/horario-admin.interface';

interface Wrapped<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class HorariosAdminService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/horarios-admin`;

  getAll(trabajadorId?: string): Observable<HorarioAdmin[]> {
    const options = trabajadorId ? { params: { trabajadorId } } : {};
    return this.http.get<Wrapped<HorarioAdmin[]>>(this.api, options).pipe(map(r => r.data));
  }

  create(dto: CreateHorarioAdminDto): Observable<HorarioAdmin> {
    return this.http.post<Wrapped<HorarioAdmin>>(this.api, dto).pipe(map(r => r.data));
  }

  update(id: string, dto: UpdateHorarioAdminDto): Observable<HorarioAdmin> {
    return this.http.patch<Wrapped<HorarioAdmin>>(`${this.api}/${id}`, dto).pipe(map(r => r.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
