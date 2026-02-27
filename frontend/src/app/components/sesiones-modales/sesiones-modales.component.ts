import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SesionAccionesService } from '../../services/sesiones-acciones.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sesion-modales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sesiones-modales.component.html',
})
export class SesionModalesComponent {
  accionesSvc = inject(SesionAccionesService);

  // El componente padre pasa su función de refresco
  @Input() onRefresh: () => void = () => {};
}