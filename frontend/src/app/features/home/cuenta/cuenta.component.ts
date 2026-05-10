import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { TrabajadorService } from '../../../services/trabajadores.service';
import { finalize } from 'rxjs';

type PasswordForm = { passwordActual: string; passwordNueva: string; confirmar: string };

@Component({
  standalone: true,
  selector: 'app-cuenta',
  imports: [CommonModule],
  templateUrl: './cuenta.component.html',
})
export default class CuentaComponent implements OnDestroy {
  readonly auth = inject(AuthService);
  private readonly trabajadoresSvc = inject(TrabajadorService);

  form      = signal<PasswordForm>({ passwordActual: '', passwordNueva: '', confirmar: '' });
  guardando = signal(false);
  exito     = signal(false);
  error     = signal<string | null>(null);
  mostrar   = signal({ actual: false, nueva: false, confirmar: false });

  private exitoTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
    if (this.exitoTimer !== null) clearTimeout(this.exitoTimer);
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

    this.guardando.set(true);
    this.error.set(null);

    this.trabajadoresSvc.cambiarPasswordPropio(passwordActual, passwordNueva)
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
