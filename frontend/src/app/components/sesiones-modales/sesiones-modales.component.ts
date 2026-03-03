import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SesionAccionesService } from '../../services/sesiones-acciones.service';
import { TIPO_SESION_LABELS, ESTADO_SESION_LABELS } from '../../interface/sesion.interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sesion-modales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sesiones-modales.component.html',
})
export class SesionModalesComponent {
  accionesSvc = inject(SesionAccionesService);
  readonly TIPO_SESION_LABELS = TIPO_SESION_LABELS;
  readonly ESTADO_SESION_LABELS = ESTADO_SESION_LABELS;

  // El componente padre pasa su función de refresco
  @Input() onRefresh: () => void = () => {};
}