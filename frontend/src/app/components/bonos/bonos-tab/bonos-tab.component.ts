import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BonosService } from '../../../services/bonos.service';
import { ClientesService } from '../../../services/cliente.service';
import { Bono, ESTADO_BONO_CONFIG, METODO_PAGO_LABELS, getBonoProgreso } from '../../../interface/bono.interface';
import { CreateBonoModalComponent } from '../create-bono-modal/create-bono-modal.component';
import { RegistrarPagoModalComponent } from '../registrar-pago-modal/registrar-pago-modal.component';
import { HistorialModalComponent } from '../historial-modal/historial-modal.component';

@Component({
  selector: 'app-bonos-tab',
  standalone: true,
  imports: [CommonModule, CreateBonoModalComponent, RegistrarPagoModalComponent, HistorialModalComponent],
  templateUrl: './bonos-tab.component.html',
  styleUrls: ['./bonos-tab.component.scss'],
})
export class BonosTabComponent implements OnInit {
  private route        = inject(ActivatedRoute);
  private bonosService = inject(BonosService);
  private clientesSvc  = inject(ClientesService);

  readonly bonoActivo     = this.bonosService.bonoActivo;
  readonly historialBonos = this.bonosService.historialBonos;
  readonly familiares     = this.clientesSvc.contactosFamiliares;
  readonly isLoading      = signal(false);

  clienteId = '';

  // Modales
  showCreateModal   = signal(false);
  showPagoModal     = signal(false);
  showHistorialModal = signal(false);
  bonoParaPago      = signal<Bono | null>(null);

  // Helpers accesibles en template
  readonly estadoConfig     = ESTADO_BONO_CONFIG;
  readonly metodoPagoLabels = METODO_PAGO_LABELS;
  readonly getProgreso      = getBonoProgreso;

  ngOnInit() {
    this.clienteId = this.route.parent?.snapshot.paramMap.get('id') || '';
    if (this.clienteId) {
      this.isLoading.set(true);
      this.bonosService.loadBonosCliente(this.clienteId)
        .subscribe({ complete: () => this.isLoading.set(false) });
    }
  }

  openPagoModal(bono: Bono) {
    this.bonoParaPago.set(bono);
    this.showPagoModal.set(true);
  }

  onBonoCreado() {
    this.showCreateModal.set(false);
  }

  onPagoRegistrado() {
    this.showPagoModal.set(false);
    this.bonoParaPago.set(null);
  }
}

export default BonosTabComponent;
