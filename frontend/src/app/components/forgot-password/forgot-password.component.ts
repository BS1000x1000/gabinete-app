import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

type State = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private auth = inject(AuthService);
  private fb   = inject(FormBuilder);

  state        = signal<State>('idle');
  serverError  = signal<string | null>(null);
  currentYear  = new Date().getFullYear();

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.state.set('loading');
    this.serverError.set(null);

    this.auth.forgotPassword(this.form.value.email).subscribe({
      next: () => this.state.set('success'),
      error: () => {
        // Por seguridad mostramos el mismo mensaje de exito aunque falle
        this.state.set('success');
      },
    });
  }
}
