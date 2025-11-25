import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { TurnoAgenda } from "../../models/turno.model";
import { TurnosService } from "../../services/turnos.service";
import { MOCK_TURNOS } from "./mock-turnos";
import { ScheduleComponent } from "../../components/schedule/schedule";
import { AuthService } from "../../services/auth.service";

// src/app/features/home/home.component.ts
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ScheduleComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class HomeComponent implements OnInit {
  turnos = signal<TurnoAgenda[]>([]);
  activePill = signal<'agenda' | 'cuadrante'>('agenda');
  private auth = inject(AuthService);

  /* signal<number | null>  →  la usás en el template */
  currentTeacherId = this.auth.currentTeacherId;

  constructor(private turnosSvc: TurnosService) {}

  ngOnInit() {
    // this.turnosSvc.getAgendaHoy().subscribe((data: any) => this.turnos.set(data));
    this.turnos.set(MOCK_TURNOS);
  }

  marcarAsistencia(id: number, valor: boolean) {
    this.turnosSvc.marcarAsistencia(id, valor).subscribe(() => {
      this.turnos.update((lista) =>
        lista.map((t) => (t.id === id ? { ...t, asistio: valor } : t))
      );
    });
  }
}