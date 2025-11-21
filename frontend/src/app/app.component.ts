import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/layout/sidebar/sidebar.component';
import { NgScrollbar } from 'ngx-scrollbar';
import { FooterComponent } from './shared/components/layout/footer/footer.component';
import { HeaderComponent } from './shared/components/layout/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ReactiveFormsModule,
    CommonModule,
    SidebarComponent,
    NgScrollbar,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  loginForm!: FormGroup; // '!' indica que será inicializado en ngOnInit

  // Propiedades para mostrar mensajes al usuario
  message: string = '';
  isError: boolean = false;

  constructor() {}

  // ngOnInit se ejecuta una vez después del constructor
  ngOnInit(): void {
    // Inicializa el FormGroup con sus FormControls y validadores
    this.loginForm = new FormGroup({
      username: new FormControl('', Validators.required), // Campo requerido
      password: new FormControl('', [
        Validators.required, // Campo requerido
        Validators.minLength(6), // Mínimo de 6 caracteres
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
      if (username === 'admin' && password === '12345') {
        this.message = '¡Inicio de sesión exitoso! Redirigiendo...';
        this.isError = false;
        // En una aplicación real, llamarías a un servicio de autenticación
        // y luego redirigirías al usuario.
        // this.router.navigate(['/dashboard']);
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
