import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Signals
  loading = signal(false);
  serverError = signal<string | null>(null);
  hidePwd = signal(true);

  // Año actual para el footer
  currentYear = new Date().getFullYear();

  // Formulario
  form: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    // Marcar todos los campos como touched para mostrar errores
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    this.serverError.set(null);

    const credentials = {
      username: this.form.value.username,
      password: this.form.value.password
    };

    console.log('🔐 Intentando login con:', credentials.username);

    this.auth.login(credentials).subscribe({
      next: (response) => {
        console.log('✅ Login exitoso:', response);
        this.loading.set(false);
        
        // Pequeño delay para mejor UX
        setTimeout(() => {
          console.log('🚀 Redirigiendo a /home');
          this.router.navigate(['/home']);
        }, 100);
      },
      error: (error) => {
        console.error('❌ Error en login:', error);
        this.loading.set(false);
        
        // Mensajes de error más amigables
        if (error.status === 401) {
          this.serverError.set('Usuario o contraseña incorrectos');
        } else if (error.status === 0) {
          this.serverError.set('No se pudo conectar con el servidor');
        } else {
          this.serverError.set('Error al iniciar sesión. Inténtalo de nuevo.');
        }
      }
    });
  }
}