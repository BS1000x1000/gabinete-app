import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

// Asume que este es un servicio de autenticación que proporciona datos del usuario
import { AuthService, User } from '../../../../services/auth.service';
import { ClicableComponent } from '../../clicable-image/clicable-image.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ClicableComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  user$: Observable<User | null> | undefined;

  // Puedes usar una señal para el término de búsqueda
  searchQuery = signal<string>('');

  ngOnInit(): void {
    // Suscribirse al Observable del usuario para obtener sus datos
    this.user$ = this.authService.getCurrentUser();
  }

  // Ejemplo de método para la funcionalidad de búsqueda
  onSearch() {
    console.log('Buscando:', this.searchQuery());
    // Aquí podrías implementar la lógica de búsqueda, como llamar a un servicio
  }
}