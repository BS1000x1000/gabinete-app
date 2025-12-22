import { Component, inject } from '@angular/core';
import { ClientesService } from '../../../../../services/cliente.service';

@Component({
  selector: 'app-sanitario-tab',
  standalone: true,
  imports: [],
  templateUrl: './sanitario-tab.component.html',
  styleUrl: './sanitario-tab.component.scss'
})
export class SanitarioTabComponent {
  private clientesvc = inject(ClientesService);
  sanitario = this.clientesvc.sanitario;

}

export default SanitarioTabComponent;