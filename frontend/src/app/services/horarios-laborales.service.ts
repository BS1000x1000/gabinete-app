import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import {
  HorarioLaboral,
  CreateHorarioLaboralDto,
  UpdateHorarioLaboralDto,
} from '../interface/horario-laboral.interface';

interface Wrapped<T> { data: T; }

/**
 * Disponibilidad declarada del terapeuta. El módulo se llama
 * `horarios-laborales` por historia —nació como "jornada laboral"—; lo que
 * modela es cuándo el autónomo puede ofrecer hueco a una familia. Ver el
 * doc-comment de `HorarioLaboral` en `schema.prisma` para el porqué del nombre.
 *
 * Llevaba en el backend desde el principio —controlador, servicio, tests y
 * motor de avisos— sin una sola pantalla que lo rellenara, así que el aviso
 * `FUERA_DE_DISPONIBILIDAD` no llegaba a saltar nunca.
 */
@Injectable({ providedIn: 'root' })
export class HorariosLaboralesService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/horarios-laborales`;

  getByTrabajador(trabajadorId: string): Observable<HorarioLaboral[]> {
    return this.http
      .get<Wrapped<HorarioLaboral[]>>(`${this.api}/trabajador/${trabajadorId}`)
      .pipe(map(r => r.data ?? (r as any) ?? []));
  }

  create(trabajadorId: string, dto: CreateHorarioLaboralDto): Observable<HorarioLaboral> {
    return this.http
      .post<Wrapped<HorarioLaboral>>(`${this.api}/trabajador/${trabajadorId}`, dto)
      .pipe(map(r => r.data ?? (r as any)));
  }

  update(id: string, dto: UpdateHorarioLaboralDto): Observable<HorarioLaboral> {
    return this.http
      .patch<Wrapped<HorarioLaboral>>(`${this.api}/${id}`, dto)
      .pipe(map(r => r.data ?? (r as any)));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(map(() => void 0));
  }
}
