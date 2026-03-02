import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BonosService } from '../../../services/bonos.service';
import { Bono, MetodoPago } from '../../../interface/bono.interface';

@Component({
  selector: 'app-registrar-pago-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-pago-modal.component.html',
})
export class RegistrarPagoModalComponent {
  @Input({ required: true }) bono!: Bono;

  @Output() pagoRegistrado = new EventEmitter<void>();
  @Output() cerrar         = new EventEmitter<void>();

  private bonosService = inject(BonosService);

  readonly metodos: { value: MetodoPago; label: string; icon: string }[] = [
    { value: 'EFECTIVO',      label: 'Efectivo',      icon: '💵' },
    { value: 'TRANSFERENCIA', label: 'Transferencia', icon: '🏦' },
    { value: 'BIZUM',         label: 'Bizum',         icon: '📱' },
    { value: 'TARJETA',       label: 'Tarjeta',       icon: '💳' },
  ];

  metodoPago  = signal<MetodoPago | null>(null);
  fechaPago   = signal<string>(new Date().toISOString().split('T')[0]);
  isLoading   = signal(false);
  error       = signal<string | null>(null);

  submit() {
    if (!this.metodoPago()) return;
    this.isLoading.set(true);
    this.error.set(null);

    this.bonosService.registrarPago(this.bono.id, {
      metodoPago: this.metodoPago()!,
      fechaPago:  this.fechaPago() || undefined,
    }).subscribe({
      next:  () => { this.isLoading.set(false); this.pagoRegistrado.emit(); },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message ?? 'Error al registrar el pago.');
      },
    });
  }
}
