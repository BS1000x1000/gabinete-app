import { Component, inject } from '@angular/core';
import { ClientesService } from '../../../../../services/cliente.service';

@Component({
  selector: 'app-contactos-tab',
  standalone: true,
  imports: [],
  templateUrl: './contactos-tab.component.html',
  styleUrl: './contactos-tab.component.scss'
})
export class ContactosTabComponent {

  private clienteSvc = inject(ClientesService);
  contactos = this.clienteSvc.contactos;
}

export default ContactosTabComponent;
