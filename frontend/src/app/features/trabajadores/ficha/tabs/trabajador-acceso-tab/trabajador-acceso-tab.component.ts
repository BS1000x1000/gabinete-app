import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TrabajadorService } from '../../../../../services/trabajadores.service';
import { AuthService } from '../../../../../services/auth.service';
import { computeStrength } from '../../../../../shared/utils/password-strength.utils';

interface PwdForm {
  passwordActual: string;
  passwordNueva: string;
  passwordConfirmar: string;
}

@Component({
  selector: 'app-trabajador-acceso-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trabajador-acceso-tab.component.html',
})
export class TrabajadorAccesoTabComponent implements OnInit, OnDestroy {
  private readonly route         = inject(ActivatedRoute);
  private readonly trabajadorSvc = inject(TrabajadorService);
  readonly auth = inject(AuthService);

  private trabajadorId = '';
  private exitoTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly tieneAcceso = computed(() =>
    this.auth.canVerTodo() || this.auth.currentTrabajadorId() === this.trabajadorId
  );

  readonly form = signal<PwdForm>({
    passwordActual: '',
    passwordNueva: '',
    passwordConfirmar: '',
  });

  readonly guardando    = signal(false);
  readonly error        = signal<string | null>(null);
  readonly exito        = signal<string | null>(null);
  readonly hideActual   = signal(true);
  readonly hideNueva    = signal(true);
  readonly hideConfirmar = signal(true);

  readonly strength      = computed(() => computeStrength(this.form().passwordNueva));
  readonly passwordsMatch = computed(() => {
    const f = this.form();
    return !!f.passwordConfirmar && f.passwordNueva === f.passwordConfirmar;
  });

  ngOnInit(): void {
    this.trabajadorId = this.route.parent?.snapshot.paramMap.get('id') ?? '';
  }

  ngOnDestroy(): void {
    if (this.exitoTimeout !== null) clearTimeout(this.exitoTimeout);
  }

  updateField(field: keyof PwdForm, value: string): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  guardar(): void {
    const f = this.form();

    if (!f.passwordActual) {
      this.error.set('La contraseña actual es obligatoria.');
      return;
    }
    if (!f.passwordNueva || f.passwordNueva.length < 8) {
      this.error.set('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (f.passwordNueva !== f.passwordConfirmar) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    this.trabajadorSvc
      .cambiarPassword(this.trabajadorId, f.passwordActual, f.passwordNueva)
      .subscribe({
        next: () => {
          this.form.set({ passwordActual: '', passwordNueva: '', passwordConfirmar: '' });
          this.guardando.set(false);
          this.exito.set('Contraseña actualizada correctamente.');
          this.exitoTimeout = setTimeout(() => this.exito.set(null), 4000);
        },
        error: (err: any) => {
          this.error.set(err?.error?.message ?? 'Error al cambiar la contraseña.');
          this.guardando.set(false);
        },
      });
  }
}

export default TrabajadorAccesoTabComponent;
