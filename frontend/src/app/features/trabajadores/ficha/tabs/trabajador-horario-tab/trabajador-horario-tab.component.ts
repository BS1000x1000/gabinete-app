import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { AuthService } from '../../../../../services/auth.service';
import { HorariosAdminService } from '../../../../../services/horarios-admin.service';
import {
  HorarioAdmin,
  DIA_SEMANA_LABELS,
} from '../../../../../interface/horario-admin.interface';
import { ConfirmModalComponent } from '../../../../../shared/components/confirm-modal/confirm-modal.component';

type FormRegla = { diasSeleccionados: number[]; horaInicio: string; horaFin: string; titulo: string };

@Component({
  selector: 'app-trabajador-horario-tab',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  templateUrl: './trabajador-horario-tab.component.html',
})
export default class TrabajadorHorarioTabComponent implements OnInit {
  private readonly route       = inject(ActivatedRoute);
  private readonly auth        = inject(AuthService);
  private readonly horariosSvc = inject(HorariosAdminService);
  private readonly destroyRef  = inject(DestroyRef);

  readonly DIA_SEMANA_LABELS = DIA_SEMANA_LABELS;
  readonly diasSemana = [1, 2, 3, 4, 5, 6, 7];

  private readonly trabajadorId = this.route.parent?.snapshot.paramMap.get('id') ?? '';

  readonly puedeEditar = computed(() =>
    this.auth.currentTrabajadorId() === this.trabajadorId,
  );

  reglas         = signal<HorarioAdmin[]>([]);
  cargandoReglas = signal(false);
  errorReglas    = signal<string | null>(null);
  guardandoRegla = signal(false);

  mostrarFormNueva  = signal(false);
  reglaEditando     = signal<HorarioAdmin | null>(null);
  pendingDeleteId   = signal<string | null>(null);

  formNueva = signal<FormRegla>({
    diasSeleccionados: [],
    horaInicio: '09:00',
    horaFin: '10:00',
    titulo: '',
  });

  formEditar = signal<{ horaInicio: string; horaFin: string; titulo: string }>({
    horaInicio: '09:00',
    horaFin: '10:00',
    titulo: '',
  });

  readonly reglasPorDia = computed(() => {
    const map = new Map<number, HorarioAdmin[]>();
    for (const r of this.reglas()) {
      if (!map.has(r.diaSemana)) map.set(r.diaSemana, []);
      map.get(r.diaSemana)!.push(r);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([dia, reglas]) => ({ dia, label: DIA_SEMANA_LABELS[dia], reglas }));
  });

  ngOnInit(): void {
    this.cargarReglas();
  }

  cargarReglas(): void {
    this.cargandoReglas.set(true);
    this.horariosSvc.getAll(this.trabajadorId)
      .pipe(finalize(() => this.cargandoReglas.set(false)))
      .subscribe({
        next: r => this.reglas.set(r),
        error: () => this.errorReglas.set('No se pudieron cargar las reglas.'),
      });
  }

  abrirFormNueva(): void {
    this.reglaEditando.set(null);
    this.formNueva.set({ diasSeleccionados: [], horaInicio: '09:00', horaFin: '10:00', titulo: '' });
    this.mostrarFormNueva.set(true);
  }

  cancelarFormNueva(): void {
    this.mostrarFormNueva.set(false);
  }

  toggleDia(dia: number): void {
    this.formNueva.update(f => {
      const dias = f.diasSeleccionados.includes(dia)
        ? f.diasSeleccionados.filter(d => d !== dia)
        : [...f.diasSeleccionados, dia].sort((a, b) => a - b);
      return { ...f, diasSeleccionados: dias };
    });
  }

  guardarNuevasReglas(): void {
    const f = this.formNueva();
    if (!f.diasSeleccionados.length || !f.horaInicio || !f.horaFin) {
      this.errorReglas.set('Selecciona al menos un día y define el horario.');
      return;
    }
    if (f.horaFin <= f.horaInicio) {
      this.errorReglas.set('La hora de fin debe ser posterior a la de inicio.');
      return;
    }
    this.errorReglas.set(null);
    this.guardandoRegla.set(true);

    forkJoin(f.diasSeleccionados.map(dia =>
      this.horariosSvc.create({
        diaSemana: dia,
        horaInicio: f.horaInicio,
        horaFin: f.horaFin,
        titulo: f.titulo || undefined,
      })
    ))
      .pipe(finalize(() => this.guardandoRegla.set(false)))
      .subscribe({
        next: () => { this.mostrarFormNueva.set(false); this.cargarReglas(); },
        error: () => this.errorReglas.set('Error al guardar las reglas.'),
      });
  }

  setFormEditar(field: 'horaInicio' | 'horaFin' | 'titulo', value: string): void {
    this.formEditar.update(f => ({ ...f, [field]: value }));
  }

  setFormNueva(field: 'horaInicio' | 'horaFin' | 'titulo', value: string): void {
    this.formNueva.update(f => ({ ...f, [field]: value }));
  }

  iniciarEdicion(regla: HorarioAdmin): void {
    this.reglaEditando.set(regla);
    this.formEditar.set({ horaInicio: regla.horaInicio, horaFin: regla.horaFin, titulo: regla.titulo });
  }

  cancelarEdicion(): void {
    this.reglaEditando.set(null);
  }

  guardarEdicion(): void {
    const regla = this.reglaEditando();
    if (!regla) return;
    const f = this.formEditar();
    if (f.horaFin <= f.horaInicio) {
      this.errorReglas.set('La hora de fin debe ser posterior a la de inicio.');
      return;
    }
    this.errorReglas.set(null);
    this.guardandoRegla.set(true);
    this.horariosSvc.update(regla.id, { horaInicio: f.horaInicio, horaFin: f.horaFin, titulo: f.titulo })
      .pipe(finalize(() => this.guardandoRegla.set(false)))
      .subscribe({
        next: () => { this.reglaEditando.set(null); this.cargarReglas(); },
        error: () => this.errorReglas.set('Error al actualizar la regla.'),
      });
  }

  eliminarRegla(id: string): void {
    this.pendingDeleteId.set(id);
  }

  onConfirmarEliminar(): void {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.pendingDeleteId.set(null);
    this.horariosSvc.delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.cargarReglas(),
        error: () => this.errorReglas.set('Error al eliminar la regla.'),
      });
  }

  onCancelarEliminar(): void {
    this.pendingDeleteId.set(null);
  }
}
