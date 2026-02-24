import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../../../../../services/cliente.service';
import { DataFieldComponent } from '../../../../../shared/components/data-field/data-field.component';

@Component({
  selector: 'app-contactos-tab',
  standalone: true,
  imports: [CommonModule, DataFieldComponent],
  templateUrl: './contactos-tab.component.html',
})
export class ContactosTabComponent {
  private clienteSvc = inject(ClientesService);
  
  // ✅ CORREGIDO: Acceder al array completo desde el backend
  contactosFamiliares = computed(() => {
    // Aquí necesitas acceder a los contactos desde el backend
    // Si no los tienes en el signal, agrégalos en el servicio
    return this.clienteSvc.contactosFamiliares?.() || [];
  });
}

export default ContactosTabComponent;