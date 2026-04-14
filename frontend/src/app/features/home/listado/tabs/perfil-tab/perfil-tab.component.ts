import {
  Component,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ClientesService } from '../../../../../services/cliente.service';
import { DrawerService, DrawerSection } from '../../../../../services/drawer.service';
import { ClienteDrawerComponent } from '../../../../../shared/components/cliente-drawer/cliente-drawer.component';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-perfil-tab',
  imports: [CommonModule, ClienteDrawerComponent],
  templateUrl: './perfil-tab.component.html',
})
export class PerfilTabComponent {
  private route = inject(ActivatedRoute);
  readonly clientesSvc = inject(ClientesService);
  private drawerSvc = inject(DrawerService);
  readonly auth = inject(AuthService);

  @ViewChild(ClienteDrawerComponent) drawer!: ClienteDrawerComponent;

  readonly cliente = this.clientesSvc.cliente;
  readonly clienteRaw = this.clientesSvc.clienteRaw;
  readonly familiares = this.clientesSvc.contactosFamiliares;
  readonly colegio = this.clientesSvc.colegio;
  readonly sanitario = this.clientesSvc.sanitario;

  guardandoRgpd = signal(false);
  errorRgpd = signal<string | null>(null);
  exportando = signal(false);

  openDrawer(section: DrawerSection): void {
    const id = this.route.parent?.snapshot.paramMap.get('id') ?? '';
    this.drawerSvc.open(section, id);
    setTimeout(() => this.drawer?.onDrawerOpened(section), 0);
  }

  toggleConsentimientoRgpd(): void {
    const id = this.route.parent?.snapshot.paramMap.get('id') ?? '';
    const actual = this.clienteRaw()?.consentimientoRgpd ?? false;
    this.guardandoRgpd.set(true);
    this.errorRgpd.set(null);
    this.clientesSvc.updateCliente(id, { consentimientoRgpd: !actual }).subscribe({
      next: () => {
        this.guardandoRgpd.set(false);
        this.clientesSvc.loadAll(id).subscribe();
      },
      error: (err) => {
        this.guardandoRgpd.set(false);
        this.errorRgpd.set(err?.error?.message ?? 'Error al guardar');
      },
    });
  }

  exportarDatosRgpd(): void {
    const id = this.route.parent?.snapshot.paramMap.get('id') ?? '';
    const raw = this.clienteRaw();
    const nombre = raw ? `${raw.nombre}_${raw.apellidos}` : id;
    this.exportando.set(true);
    this.clientesSvc.exportarDatos(id, nombre).subscribe({
      next: () => this.exportando.set(false),
      error: () => this.exportando.set(false),
    });
  }
}

export default PerfilTabComponent;
