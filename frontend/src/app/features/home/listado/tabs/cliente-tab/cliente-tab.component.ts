import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../../../../../services/cliente.service';
import { DataFieldComponent } from '../../../../../shared/components/data-field/data-field.component';

@Component({
  selector: 'app-cliente-tab',
  standalone: true,
  imports: [CommonModule, DataFieldComponent],
  templateUrl: './cliente-tab.component.html',
})
export class ClienteTabComponent {
  private clienteSvc = inject(ClientesService);
  cliente = this.clienteSvc.cliente;
}

export default ClienteTabComponent;