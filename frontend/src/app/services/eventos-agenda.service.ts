import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import {
  EventoAgenda,
  CreateEventoDto,
  UpdateEventoDto,
  ResumenHoras,
} from '../interface/evento-agenda.interface';

interface Wrapped<T> { data: T; }

@Injectable({ providedIn: 'root' })
export class EventosAgendaService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/eventos-agenda`;

  getEventosPeriodo(desde: string, hasta: string, trabajadorId?: string): Observable<EventoAgenda[]> {
    let params = new HttpParams().set('desde', desde).set('hasta', hasta);
    if (trabajadorId) params = params.set('trabajadorId', trabajadorId);
    return this.http.get<Wrapped<EventoAgenda[]>>(this.api, { params }).pipe(map(r => r.data));
  }

  getResumenHoras(desde: string, hasta: string, trabajadorId?: string): Observable<ResumenHoras> {
    let params = new HttpParams().set('desde', desde).set('hasta', hasta);
    if (trabajadorId) params = params.set('trabajadorId', trabajadorId);
    return this.http.get<Wrapped<ResumenHoras>>(`${this.api}/horas`, { params }).pipe(map(r => r.data));
  }

  getEvento(id: string): Observable<EventoAgenda> {
    return this.http.get<Wrapped<EventoAgenda>>(`${this.api}/${id}`).pipe(map(r => r.data));
  }

  create(dto: CreateEventoDto): Observable<EventoAgenda> {
    return this.http.post<Wrapped<EventoAgenda>>(this.api, dto).pipe(map(r => r.data));
  }

  update(id: string, dto: UpdateEventoDto): Observable<EventoAgenda> {
    return this.http.patch<Wrapped<EventoAgenda>>(`${this.api}/${id}`, dto).pipe(map(r => r.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
