import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BonosService } from '../../../services/bonos.service';

@Component({
  selector: 'app-create-bono-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-bono-modal.component.html',
})
export class CreateBonoModalComponent {
  @Input({ required: true }) clienteId!: string;
  @Input() familiares: any[] = [];

  @Output() bonoCreado = new EventEmitter<void>();
  @Output() cerrar     = new EventEmitter<void>();

  private bonosService = inject(BonosService);

  sesionesSeleccionadas = signal<number>(4);
  precioInput           = signal<number>(0);
  familiarPagoId        = signal<string>('');
  notas                 = signal<string>('');
  usarCustomSesiones    = signal(false);
  customSesiones        = signal<number | null>(null);
  isLoading             = signal(false);
  error                 = signal<string | null>(null);

  readonly opcionesSesiones = [4, 8];

  get sesionesFinales(): number {
    return this.usarCustomSesiones() && this.customSesiones()
      ? this.customSesiones()!
      : this.sesionesSeleccionadas();
  }

  selectSesiones(n: number) {
    this.sesionesSeleccionadas.set(n);
    this.usarCustomSesiones.set(false);
  }

  activarCustom() {
    this.usarCustomSesiones.set(true);
  }

  submit() {
    if (!this.sesionesFinales || !this.precioInput()) return;
    this.isLoading.set(true);
    this.error.set(null);

    this.bonosService.createBono({
      clienteId:      this.clienteId,
      totalSesiones:  this.sesionesFinales,
      precio:         this.precioInput(),
      familiarPagoId: this.familiarPagoId() || undefined,
      notas:          this.notas() || undefined,
    }).subscribe({
      next:  () => { this.isLoading.set(false); this.bonoCreado.emit(); },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message ?? 'Error al crear el bono. Inténtalo de nuevo.');
      },
    });
  }
}
