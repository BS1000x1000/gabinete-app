import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { HorarioData } from '../../../../interface/horario.interface';

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
  turnos = this.agendaSvc.turnos;
  modoFijo = signal<'agenda' | 'cuadrante'>('agenda');

  /* signal<number | null>  →  la usás en el template */
  currentTrabajadorId = this.auth.currentTrabajadorId;
  selectedRowId = signal<string | null>(null);
  constructor(private turnosSvc: TurnosService) {}

  clienteIdTurno = computed(() => {
    const turnosArray = this.turnos();
    if(turnosArray.length > 0) return turnosArray[0].clienteId;
    return null;
  })

  ngOnInit() {
    this.loadHorarios();
    // this.turnosSvc.getAgendaHoy().subscribe((data: any) => this.turnos.set(data));
    // this.turnos.set(MOCK_TURNOS);
  }

  loadHorarios() {
    const trabajadorId = this.auth.currentTrabajadorId();
    console.log('Trabajador ID', trabajadorId);
    this.turnosSvc.getHorariosMapped(trabajadorId!).subscribe({
      next: (data) => this.turnos.set(data),
      error: (err) => console.error('Error al cargar horarios:', err),
    });
  }

  verDetalle(horario: HorarioData) {
    const clienteId = horario.clienteId;
    this.agendaSvc.setSelectedId(horario.id);
    this.router.navigate(['/home/listado', clienteId]);
  }

  marcarAsistencia(id: string, valor: boolean) {
    // this.turnosSvc.marcarAsistencia(id, valor).subscribe(() => {
    //   this.turnos.update((lista) =>
    //     lista.map((t) => (t.id === id ? { ...t, asistio: valor } : t))
    //   );
    // });
  }

  onFilaClick(horario: HorarioData) {
    this.selectedRowId.update((id) => (id === horario.id! ? null : horario.id!));
    this.router.navigate(['/home/listado', horario.clienteId, 'cliente']);
  }
}
