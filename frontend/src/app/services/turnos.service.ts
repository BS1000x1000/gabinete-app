import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TurnoAgenda } from "../models/turno.model";

// src/app/services/turnos.service.ts
@Injectable({ providedIn: 'root' })
export class TurnosService {
  private api = '/api/turnos';

  constructor(private http: HttpClient) {}

  getAgendaHoy() {
    return this.http.get<TurnoAgenda[]>(`${this.api}/agenda/hoy`);
  }

  marcarAsistencia(id: number, valor: boolean) {
    return this.http.patch(`${this.api}/${id}/asistencia`, { asistio: valor });
  }
}