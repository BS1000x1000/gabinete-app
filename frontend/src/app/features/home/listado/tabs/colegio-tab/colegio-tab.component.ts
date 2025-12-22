import { Component, inject } from '@angular/core';
import { ClientesService } from '../../../../../services/cliente.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-colegio-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './colegio-tab.component.html',
  styleUrl: './colegio-tab.component.scss'
})
export class ColegioTabComponent {
  private clienteSvc = inject(ClientesService);
  colegio = this.clienteSvc.colegio;
  sanitario = this.clienteSvc.sanitario;
}

export default ColegioTabComponent;