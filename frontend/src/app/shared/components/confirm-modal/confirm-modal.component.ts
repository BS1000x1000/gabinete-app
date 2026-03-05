import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
})
export class ConfirmModalComponent {
  @Input() title    = '¿Confirmar acción?';
  @Input() message  = '¿Estás seguro de que quieres continuar?';
  @Input() confirmLabel = 'Confirmar';
  @Input() confirmClass = 'btn-danger';
  @Input() icon     = 'bi-exclamation-triangle-fill';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
