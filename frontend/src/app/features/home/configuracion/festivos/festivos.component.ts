import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { FestivosService } from '../../../../services/festivos.service';
import { AmbitoFestivo, CreateFestivoPayload } from '../../../../interface/festivo.interface';

type FormFestivo = {
  fecha: string;
  descripcion: string;
  ambito: AmbitoFestivo;
  ccaa: string;
  provincia: string;
};

const EMPTY_FORM = (): FormFestivo => ({
  fecha: '',
  descripcion: '',
  ambito: 'NACIONAL',
  ccaa: '',
  provincia: '',
});

@Component({
  standalone: true,
  selector: 'app-festivos-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './festivos.component.html',
})
export default class FestivosAdminComponent implements OnInit {
  private readonly festivosSvc = inject(FestivosService);

  anioActivo        = signal(new Date().getFullYear());
  mostrarFormulario = signal(false);
  guardando         = signal(false);
  errorForm         = signal<string | null>(null);
  confirmEliminarId = signal<string | null>(null);
  cargando          = signal(false);
  eliminandoId      = signal<string | null>(null);

  form = signal<FormFestivo>(EMPTY_FORM());

  readonly festivos        = this.festivosSvc.festivos;
  readonly tieneNacionales = computed(() => this.festivos().some(f => f.ambito === 'NACIONAL'));

  ngOnInit(): void {
    this.cargarFestivos();
  }

  cargarFestivos(): void {
    this.cargando.set(true);
    this.festivosSvc.getFestivos(this.anioActivo())
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe();
  }

  cambiarAnio(delta: number): void {
    this.anioActivo.update(a => a + delta);
    this.confirmEliminarId.set(null);
    this.cargarFestivos();
  }

  importarNacionales(): void {
    this.guardando.set(true);
    this.festivosSvc.importarNacionales(this.anioActivo())
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe();
  }

  toggleFormulario(): void {
    this.mostrarFormulario.update(v => !v);
    this.errorForm.set(null);
    this.form.set(EMPTY_FORM());
  }

  patchForm<K extends keyof FormFestivo>(k: K, v: FormFestivo[K]): void {
    this.form.update(f => {
      const next = { ...f, [k]: v };
      if (k === 'ambito') { next.ccaa = ''; next.provincia = ''; }
      return next;
    });
  }

  guardarFestivo(): void {
    const f = this.form();
    if (!f.fecha || !f.descripcion.trim()) {
      this.errorForm.set('Fecha y descripción son obligatorias.');
      return;
    }

    const payload: CreateFestivoPayload = {
      fecha: f.fecha,
      descripcion: f.descripcion.trim(),
      ambito: f.ambito,
      anio: this.anioActivo(),
    };
    if (f.ambito !== 'NACIONAL' && f.ccaa.trim()) payload.ccaa = f.ccaa.trim();
    if (f.ambito === 'LOCAL' && f.provincia.trim()) payload.provincia = f.provincia.trim();

    this.guardando.set(true);
    this.errorForm.set(null);
    this.festivosSvc.crear(payload)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.mostrarFormulario.set(false);
          this.form.set(EMPTY_FORM());
        },
        error: (err: any) => {
          this.errorForm.set(err?.error?.message ?? 'Error al crear el festivo.');
        },
      });
  }

  readonly AMBITO_LABEL: Record<AmbitoFestivo, string> = {
    NACIONAL: 'Nacional',
    AUTONOMICO: 'Autonómico',
    LOCAL: 'Local',
  };

  pedirConfirmar(id: string): void {
    this.confirmEliminarId.set(id);
  }

  cancelarConfirmar(): void {
    this.confirmEliminarId.set(null);
  }

  eliminar(id: string): void {
    this.eliminandoId.set(id);
    this.confirmEliminarId.set(null);
    this.festivosSvc.eliminar(id)
      .pipe(finalize(() => this.eliminandoId.set(null)))
      .subscribe();
  }
}
