import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../../../../../services/cliente.service';
import { DataFieldComponent } from '../../../../../shared/components/data-field/data-field.component';

@Component({
  selector: 'app-colegio-tab',
  standalone: true,
  imports: [CommonModule, DataFieldComponent],
  templateUrl: './colegio-tab.component.html',
})
export class ColegioTabComponent {
  private clienteSvc = inject(ClientesService);
  colegio = this.clienteSvc.colegio;
  sanitario = this.clienteSvc.sanitario;
}

export default ColegioTabComponent;