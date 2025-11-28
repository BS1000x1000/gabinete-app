// services/turnos.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { HorarioData } from '../../interface/horario.interface';

@Injectable({ providedIn: 'root' })
export class TurnosService {
  private api = 'http://localhost:3000/horarios';
  turnos = signal<HorarioData[]>([]);
  selectedId = signal<string>('');
  private http = inject(HttpClient);

  getHorarioByClienteId(id: string): Observable<HorarioData[]> {
    return this.http.get<HorarioData[]>(`${this.api}/cliente/${id}`);
  }

  getHorarioByTrabajadorId(id: string): Observable<HorarioData[]> {
    return this.http.get<HorarioData[]>(`${this.api}/trabajador/${id}`);
  }

  setSelectedId(id: string) {
    this.selectedId.set(id);
  }

  getHorariosMapped(trabajadorId: string): Observable<HorarioData[]> {
    return this.getHorarioByTrabajadorId(trabajadorId).pipe(
      map((list) =>
        list.map((h) => ({
          id: h.id,
          fechaHoraInicio: h.fechaHoraInicio,
          fechaHoraFin: h.fechaHoraFin,
          estado: h.estado,
          tipoSesion: h.tipoSesion,
          clienteId: h.clienteId,
          trabajadorId: h.trabajadorId,
          cliente: {
            id: h.clienteId,
            nombre: h.cliente.nombre,
            apellidos: h.cliente.apellidos,
          },
          asistio: null,
        }))
      )
    );
  }
}
