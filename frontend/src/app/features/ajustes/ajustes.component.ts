import { Component, computed, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { TrabajadorService } from '../../services/trabajadores.service';
import { VacacionesService } from '../../services/vacaciones.service';

type PasswordForm = { passwordActual: string; passwordNueva: string; confirmar: string };
type VacForm = { fechaInicio: string; fechaFin: string; motivo: string };

const MEET_URL_REGEX = /^https:\/\/meet\.google\.com\/.+/;
const EMPTY_VAC = (): VacForm => ({ fechaInicio: '', fechaFin: '', motivo: '' });

@Component({
  standalone: true,
  selector: 'app-ajustes',
  imports: [CommonModule, FormsModule],
  templateUrl: './ajustes.component.html',
})
export default class AjustesComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  private trabajadoresSvc = inject(TrabajadorService);
  private readonly vacacionesSvc = inject(VacacionesService);

  form      = signal<PasswordForm>({ passwordActual: '', passwordNueva: '', confirmar: '' });
  guardando = signal(false);
  exito     = signal(false);
  error     = signal<string | null>(null);
  mostrar   = signal({ actual: false, nueva: false, confirmar: false });

  // Video call URL
  urlVideollamada     = signal('');
  guardandoUrl        = signal(false);
  exitoUrl            = signal(false);
  errorUrl            = signal<string | null>(null);

  // Datos fiscales
  datosFiscales = signal({
    nifFiscal: '',
    nombreFiscal: '',
    direccionFiscal: '',
    codigoPostalFiscal: '',
    ciudadFiscal: '',
    provinciaFiscal: '',
    iban: '',
    retencionIrpf: 0,
    emailFacturacion: '',
  });
  guardandoFiscal   = signal(false);
  exitoFiscal       = signal(false);
  errorFiscal       = signal<string | null>(null);
  private exitoFiscalTimer: ReturnType<typeof setTimeout> | null = null;

  readonly vacacionesConDias = computed(() =>
    this.vacacionesSvc.misVacaciones().map(v => ({
      ...v,
      dias: Math.round(
        (new Date(v.fechaFin).getTime() - new Date(v.fechaInicio).getTime()) / 86_400_000,
      ) + 1,
    })),
  );
  cargandoVacaciones        = signal(false);
  guardandoVacacion         = signal(false);
  eliminandoVacacionId      = signal<string | null>(null);
  confirmEliminarVacacionId = signal<string | null>(null);
  vacForm                   = signal<VacForm>(EMPTY_VAC());
  errorVac                  = signal<string | null>(null);

  private exitoTimer: ReturnType<typeof setTimeout> | null = null;
  private exitoUrlTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    if (!this.auth.isRecep()) {
      this.cargandoVacaciones.set(true);
      this.vacacionesSvc.getMisVacaciones()
        .pipe(finalize(() => this.cargandoVacaciones.set(false)))
        .subscribe();
    }
    this.trabajadoresSvc.getMe().subscribe({
      next: (res) => {
        const d = res.data;
        this.urlVideollamada.set(d?.urlVideollamada ?? '');
        this.datosFiscales.set({
          nifFiscal:          d?.nifFiscal          ?? '',
          nombreFiscal:       d?.nombreFiscal       ?? '',
          direccionFiscal:    d?.direccionFiscal    ?? '',
          codigoPostalFiscal: d?.codigoPostalFiscal ?? '',
          ciudadFiscal:       d?.ciudadFiscal       ?? '',
          provinciaFiscal:    d?.provinciaFiscal    ?? '',
          iban:               d?.iban               ?? '',
          retencionIrpf:      d?.retencionIrpf      ?? 0,
          emailFacturacion:   d?.emailFacturacion   ?? '',
        });
      },
    });
  }

  ngOnDestroy(): void {
    if (this.exitoTimer !== null) clearTimeout(this.exitoTimer);
    if (this.exitoUrlTimer !== null) clearTimeout(this.exitoUrlTimer);
    if (this.exitoFiscalTimer !== null) clearTimeout(this.exitoFiscalTimer);
  }

  patchVac<K extends keyof VacForm>(k: K, v: string): void {
    this.vacForm.update(f => ({ ...f, [k]: v }));
    this.errorVac.set(null);
  }

  agregarVacaciones(): void {
    const { fechaInicio, fechaFin, motivo } = this.vacForm();
    if (!fechaInicio || !fechaFin) {
      this.errorVac.set('Las fechas de inicio y fin son obligatorias.');
      return;
    }
    if (fechaFin < fechaInicio) {
      this.errorVac.set('La fecha de fin no puede ser anterior al inicio.');
      return;
    }
    this.guardandoVacacion.set(true);
    this.errorVac.set(null);
    this.vacacionesSvc.crear({ fechaInicio, fechaFin, motivo: motivo || undefined })
      .pipe(finalize(() => this.guardandoVacacion.set(false)))
      .subscribe({
        next: () => this.vacForm.set(EMPTY_VAC()),
        error: (err: any) => {
          this.errorVac.set(err?.error?.message ?? 'Error al añadir el periodo.');
        },
      });
  }

  pedirConfirmarVacacion(id: string): void {
    this.confirmEliminarVacacionId.set(id);
  }

  cancelarConfirmarVacacion(): void {
    this.confirmEliminarVacacionId.set(null);
  }

  eliminarVacaciones(id: string): void {
    this.eliminandoVacacionId.set(id);
    this.confirmEliminarVacacionId.set(null);
    this.vacacionesSvc.eliminar(id)
      .pipe(finalize(() => this.eliminandoVacacionId.set(null)))
      .subscribe();
  }

  patchFiscal<K extends keyof ReturnType<typeof this.datosFiscales>>(k: K, v: any): void {
    this.datosFiscales.update(f => ({ ...f, [k]: v }));
  }

  guardarDatosFiscales(): void {
    this.guardandoFiscal.set(true);
    this.errorFiscal.set(null);
    this.trabajadoresSvc.updateDatosFiscales(this.datosFiscales())
      .pipe(finalize(() => this.guardandoFiscal.set(false)))
      .subscribe({
        next: () => {
          this.exitoFiscal.set(true);
          if (this.exitoFiscalTimer !== null) clearTimeout(this.exitoFiscalTimer);
          this.exitoFiscalTimer = setTimeout(() => this.exitoFiscal.set(false), 3500);
        },
        error: (err: any) => {
          this.errorFiscal.set(err?.error?.message ?? 'Error al guardar los datos fiscales.');
        },
      });
  }

  urlValida(): boolean {
    const url = this.urlVideollamada().trim();
    return url === '' || MEET_URL_REGEX.test(url);
  }

  guardarUrl(): void {
    const url = this.urlVideollamada().trim();
    if (url !== '' && !MEET_URL_REGEX.test(url)) {
      this.errorUrl.set('Debe ser una URL de Google Meet (https://meet.google.com/...)');
      return;
    }
    this.guardandoUrl.set(true);
    this.errorUrl.set(null);
    this.trabajadoresSvc.updateMe({ urlVideollamada: url || null })
      .pipe(finalize(() => this.guardandoUrl.set(false)))
      .subscribe({
        next: () => {
          this.exitoUrl.set(true);
          if (this.exitoUrlTimer !== null) clearTimeout(this.exitoUrlTimer);
          this.exitoUrlTimer = setTimeout(() => this.exitoUrl.set(false), 3500);
        },
        error: (err: any) => {
          this.errorUrl.set(err?.error?.message ?? 'Error al guardar la URL.');
        },
      });
  }

  setField(field: keyof PasswordForm, value: string): void {
    this.form.update(f => ({ ...f, [field]: value }));
    this.error.set(null);
  }

  toggleMostrar(field: 'actual' | 'nueva' | 'confirmar'): void {
    this.mostrar.update(m => ({ ...m, [field]: !m[field] }));
  }

  cambiarPassword(): void {
    const { passwordActual, passwordNueva, confirmar } = this.form();

    if (!passwordActual || !passwordNueva || !confirmar) {
      this.error.set('Completa todos los campos.');
      return;
    }
    if (passwordNueva.length < 8) {
      this.error.set('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (passwordNueva !== confirmar) {
      this.error.set('Las contraseñas nuevas no coinciden.');
      return;
    }

    const id = this.auth.currentTrabajadorId();
    if (!id) return;

    this.guardando.set(true);
    this.error.set(null);

    this.trabajadoresSvc.cambiarPassword(id, passwordActual, passwordNueva)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.form.set({ passwordActual: '', passwordNueva: '', confirmar: '' });
          this.mostrar.set({ actual: false, nueva: false, confirmar: false });
          this.exito.set(true);
          if (this.exitoTimer !== null) clearTimeout(this.exitoTimer);
          this.exitoTimer = setTimeout(() => this.exito.set(false), 4000);
        },
        error: (err: any) => {
          this.error.set(err?.error?.message ?? 'Error al cambiar la contraseña. Inténtalo de nuevo.');
        },
      });
  }
}
