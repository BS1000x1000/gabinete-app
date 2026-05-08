import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SesionAccionesService } from '../../services/sesiones-acciones.service';
import { TIPO_SESION_LABELS, ESTADO_SESION_LABELS, MODALIDAD_LABELS } from '../../interface/sesion.interface';
import { FormsModule } from '@angular/forms';
import { abrirEnlaceExterno } from '../../shared/utils/url.utils';

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
  readonly MODALIDAD_LABELS = MODALIDAD_LABELS;
  readonly abrirEnlace = abrirEnlaceExterno;

  // El componente padre pasa su función de refresco
  @Input() onRefresh: () => void = () => {};
}