/* login.component.ts */
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  hidePwd = signal(true);
  loading = signal(false);
  serverError = signal('');

  form = this.fb.nonNullable.group({
    usuario: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(3)]]
  });

  onSubmit() {
    //TODO: El login da unauthorized
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    this.serverError.set('');

    const { usuario, password } = this.form.getRawValue();
    this.auth.login({usuario, password}).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (err) => {
        this.serverError.set(err?.error?.message || 'Credenciales inválidas');
        this.loading.set(false);
      }
    });
    this.router.navigate(['/home'])
  }
}