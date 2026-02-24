import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../../../../../services/cliente.service';
import { DataFieldComponent } from '../../../../../shared/components/data-field/data-field.component';

@Component({
  selector: 'app-sanitario-tab',
  standalone: true,
  imports: [CommonModule, DataFieldComponent],
  templateUrl: './sanitario-tab.component.html',
})
export class SanitarioTabComponent {
  private clienteSvc = inject(ClientesService);
  sanitario = this.clienteSvc.sanitario;
}

export default SanitarioTabComponent;