import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm!: FormGroup; // '!' indica que será inicializado en ngOnInit

  // Propiedades para mostrar mensajes al usuario
  message: string = '';
  isError: boolean = false;

  private router = inject(Router);
  constructor() {}

  // ngOnInit se ejecuta una vez después del constructor
  ngOnInit(): void {
    // Inicializa el FormGroup con sus FormControls y validadores
    this.loginForm = new FormGroup({
      username: new FormControl('', Validators.required), // Campo requerido
      password: new FormControl('', [
        Validators.required, // Campo requerido
        Validators.minLength(3), // Mínimo de 3 caracteres
      ]),
    });
  }

  /**
   * Método que se ejecuta cuando el formulario es enviado.
   */
  onSubmit(): void {
    // Verifica si el formulario es válido antes de procesar
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value; // Obtiene los valores del formulario

      // Lógica de autenticación simulada
      if (username === 'admin' && password === '123') {
        this.message = '¡Inicio de sesión exitoso! Redirigiendo...';
        this.isError = false;
        // En una aplicación real, llamarías a un servicio de autenticación
        // y luego redirigirías al usuario.
        this.router.navigate(['/usuario']);
      } else {
        this.message = 'Usuario o contraseña incorrectos. Inténtalo de nuevo.';
        this.isError = true;
      }

      // Opcional: reiniciar el formulario después del intento
      // this.loginForm.reset(); // Restablece los campos y el estado de validación
    } else {
      // Si el formulario no es válido, marca todos los campos como "tocados"
      // para que se muestren los mensajes de validación.
      this.loginForm.markAllAsTouched();
      this.message = 'Por favor, completa todos los campos requeridos.';
      this.isError = true;
    }
  }
}
