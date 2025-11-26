import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TurnosService } from '../../../services/turnos.service';
import { TurnoAgenda } from '../../../models/turno.model';
import { CommonModule } from '@angular/common';
import { MOCK_TURNOS } from '../mock-turnos';
import { AuthService } from '../../../services/auth.service';
import { ScheduleComponent } from '../../../components/schedule/schedule.component';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, ScheduleComponent],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
})
export class AgendaComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private agendaSvc = inject(TurnosService);
  turnos = signal<TurnoAgenda[]>([]);
  modoFijo = signal<'agenda' | 'cuadrante'>('agenda');

  /* signal<number | null>  →  la usás en el template */
  currentTeacherId = this.auth.currentTeacherId;
  selectedRowId = signal<number | null>(null);
  constructor(private turnosSvc: TurnosService) {}

  ngOnInit() {
    // this.turnosSvc.getAgendaHoy().subscribe((data: any) => this.turnos.set(data));
    this.turnos.set(MOCK_TURNOS);
  }

  loadTurnos() {
    this.agendaSvc.loadTurnos().subscribe({
      next: (data) => this.agendaSvc.turnos.set(data),
      error: (err) => console.error(err),
    });
  }

  verDetalle(turnoId: number) {
    this.router.navigate(['/home/listado', turnoId], {
      relativeTo: this.route,
    });
  }

  // marcarAsistencia(id: number, valor: boolean) {
  //   this.turnosSvc.marcarAsistencia(id, valor).subscribe(() => {
  //     this.turnos.update((lista) =>
  //       lista.map((t) => (t.id === id ? { ...t, asistio: valor } : t))
  //     );
  //   });
  // }

  onFilaClick(turno: TurnoAgenda) {
    this.selectedRowId.update((id) => (id === turno.id ? null : turno.id));
  }
}
