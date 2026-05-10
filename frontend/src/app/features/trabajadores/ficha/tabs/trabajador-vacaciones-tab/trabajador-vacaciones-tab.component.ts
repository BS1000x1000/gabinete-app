import { Component, OnInit, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../../services/auth.service';
import { VacacionesService } from '../../../../../services/vacaciones.service';
import { PeriodoVacaciones, ConflictoVacaciones } from '../../../../../interface/vacaciones.interface';
import { VacPickerComponent } from './vac-picker.component';

type VacForm = { fechaInicio: string; fechaFin: string; motivo: string };
const EMPTY_VAC = (): VacForm => ({ fechaInicio: '', fechaFin: '', motivo: '' });

@Component({
  selector: 'app-trabajador-vacaciones-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, VacPickerComponent],
  templateUrl: './trabajador-vacaciones-tab.component.html',
})
export class TrabajadorVacacionesTabComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly vacacionesSvc = inject(VacacionesService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly trabajadorId: string = this.route.parent?.snapshot.paramMap.get('id') ?? '';

  readonly vacaciones        = signal<PeriodoVacaciones[]>([]);
  readonly cargando          = signal(false);
  readonly guardando         = signal(false);
  readonly eliminandoId      = signal<string | null>(null);
  readonly confirmEliminarId = signal<string | null>(null);
  readonly mostrarPicker     = signal(false);
  readonly vacForm           = signal<VacForm>(EMPTY_VAC());
  readonly errorVac          = signal<string | null>(null);
  readonly conflicto         = signal<ConflictoVacaciones | null>(null);
  readonly verificando       = signal(false);

  readonly vacacionesConDias = computed(() =>
    this.vacaciones().map(v => ({
      ...v,
      dias: Math.round(
        (new Date(v.fechaFin).getTime() - new Date(v.fechaInicio).getTime()) / 86_400_000,
      ) + 1,
    })),
  );

  readonly hayConflictos = computed(() => {
    const c = this.conflicto();
    return !!c && (c.sesiones.length > 0 || c.eventos.length > 0);
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.vacacionesSvc.getVacacionesDe(this.trabajadorId)
      .pipe(finalize(() => this.cargando.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: list => this.vacaciones.set(list) });
  }

  patchVac<K extends keyof VacForm>(k: K, v: string): void {
    this.vacForm.update(f => ({ ...f, [k]: v }));
    this.errorVac.set(null);
  }

  onRangoSeleccionado(rango: { fechaInicio: string; fechaFin: string } | null): void {
    if (!rango) {
      this.vacForm.update(f => ({ ...f, fechaInicio: '', fechaFin: '' }));
      this.conflicto.set(null);
      return;
    }
    this.vacForm.update(f => ({ ...f, fechaInicio: rango.fechaInicio, fechaFin: rango.fechaFin }));
    this.errorVac.set(null);
    this.verificando.set(true);
    this.conflicto.set(null);
    this.vacacionesSvc.verificarConflictosDe(this.trabajadorId, rango.fechaInicio, rango.fechaFin)
      .pipe(finalize(() => this.verificando.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => this.conflicto.set(result),
        error: () => this.conflicto.set(null),
      });
  }

  agregarVacaciones(): void {
    const { fechaInicio, fechaFin, motivo } = this.vacForm();
    if (!fechaInicio || !fechaFin) {
      this.errorVac.set('Selecciona un rango de fechas en el calendario.');
      return;
    }
    if (this.hayConflictos()) {
      this.errorVac.set('Hay sesiones o eventos en el período seleccionado.');
      return;
    }
    this.guardando.set(true);
    this.errorVac.set(null);
    this.vacacionesSvc.crearPara(this.trabajadorId, { fechaInicio, fechaFin, motivo: motivo || undefined })
      .pipe(finalize(() => this.guardando.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: item => {
          this.vacaciones.update(list =>
            [...list, item].sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio)),
          );
          this.vacForm.set(EMPTY_VAC());
          this.conflicto.set(null);
          this.mostrarPicker.set(false);
        },
        error: (err: any) => this.errorVac.set(err?.error?.message ?? 'Error al añadir el periodo.'),
      });
  }

  pedirConfirmar(id: string): void { this.confirmEliminarId.set(id); }
  cancelarConfirmar(): void { this.confirmEliminarId.set(null); }

  eliminar(id: string): void {
    this.eliminandoId.set(id);
    this.confirmEliminarId.set(null);
    this.vacacionesSvc.eliminar(id)
      .pipe(finalize(() => this.eliminandoId.set(null)), takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.vacaciones.update(list => list.filter(v => v.id !== id)) });
  }

  formatFecha(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
}

export default TrabajadorVacacionesTabComponent;
