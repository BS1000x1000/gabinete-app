import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { TurnoAgenda } from '../models/turno.model';
import { Observable } from 'rxjs';
import { HorarioData } from '../../interface/horario.interface';

// src/app/services/turnos.service.ts
@Injectable({ providedIn: 'root' })
export class TurnosService {
  private api = 'http://localhost:3000/agenda';
  turnos = signal<TurnoAgenda[]>([]);
  selectedId = signal<number | null>(null);
  horarios = signal<HorarioData[]>([]);

  constructor(private http: HttpClient) {}

  loadTurnos(): Observable<TurnoAgenda[]> {
    return this.http.get<TurnoAgenda[]>(this.api);
  }

  setSelectedId(id: number | null) {
    this.selectedId.set(id);
  }

  crearHorarios(list: HorarioData[]): Observable<HorarioData[]> {
    return this.http.post<HorarioData[]>(this.api, list);
  }

  // opcional: si quieres traerlos después
  getByClienteId(id: string): Observable<HorarioData[]> {
    return this.http.get<HorarioData[]>(`${this.api}/cliente/${id}`);
  }
}
