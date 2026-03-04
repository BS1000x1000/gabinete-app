import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ClientesService } from '../../../../../services/cliente.service';
import { DrawerService, DrawerSection } from '../../../../../services/drawer.service';
import { ClienteDrawerComponent } from '../../../../../shared/components/cliente-drawer/cliente-drawer.component';

@Component({
  standalone: true,
  selector: 'app-perfil-tab',
  imports: [CommonModule, ClienteDrawerComponent],
  templateUrl: './perfil-tab.component.html',
})
export class PerfilTabComponent {
  private route = inject(ActivatedRoute);
  private clientesSvc = inject(ClientesService);
  private drawerSvc = inject(DrawerService);

  @ViewChild(ClienteDrawerComponent) drawer!: ClienteDrawerComponent;

  readonly cliente = this.clientesSvc.cliente;
  readonly clienteRaw = this.clientesSvc.clienteRaw;
  readonly familiares = this.clientesSvc.contactosFamiliares;
  readonly colegio = this.clientesSvc.colegio;
  readonly sanitario = this.clientesSvc.sanitario;

  openDrawer(section: DrawerSection): void {
    const id = this.route.parent?.snapshot.paramMap.get('id') ?? '';
    this.drawerSvc.open(section, id);
    setTimeout(() => this.drawer?.onDrawerOpened(section), 0);
  }
}

export default PerfilTabComponent;
