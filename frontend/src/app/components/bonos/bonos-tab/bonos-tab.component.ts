import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BonosService } from '../../../services/bonos.service';
import { Bono, ESTADO_BONO_CONFIG, METODO_PAGO_LABELS, getBonoProgreso } from '../../../interface/bono.interface';

@Component({
  selector: 'app-bonos-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bonos-tab.component.html',
  styleUrls: ['./bonos-tab.component.scss'],
})
export class BonosTabComponent implements OnInit {
  @Input({ required: true }) clienteId!: string;
  @Input() familiares: any[] = []; // Para el selector de responsable de pago

  private bonosService = inject(BonosService);

  readonly bonoActivo     = this.bonosService.bonoActivo;
  readonly historialBonos = this.bonosService.historialBonos;
  readonly isLoading      = signal(false);

  // Modales
  showCreateModal  = signal(false);
  showPagoModal    = signal(false);
  bonoParaPago     = signal<Bono | null>(null);

  // Helpers accesibles en template
  readonly estadoConfig   = ESTADO_BONO_CONFIG;
  readonly metodoPagoLabels = METODO_PAGO_LABELS;
  readonly getProgreso    = getBonoProgreso;

  ngOnInit() {
    this.isLoading.set(true);
    this.bonosService.loadBonosCliente(this.clienteId)
      .subscribe({ complete: () => this.isLoading.set(false) });
  }

  openPagoModal(bono: Bono) {
    this.bonoParaPago.set(bono);
    this.showPagoModal.set(true);
  }

  onBonoCreado() {
    this.showCreateModal.set(false);
    // El signal se actualiza automáticamente via tap() en el service
  }

  onPagoRegistrado() {
    this.showPagoModal.set(false);
    this.bonoParaPago.set(null);
  }
}