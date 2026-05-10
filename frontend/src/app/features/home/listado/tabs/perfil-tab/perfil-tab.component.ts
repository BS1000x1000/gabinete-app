import {
  Component,
  inject,
  signal,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClientesService } from '../../../../../services/cliente.service';
import { DrawerService, DrawerSection } from '../../../../../services/drawer.service';
import { ClienteDrawerComponent } from '../../../../../shared/components/cliente-drawer/cliente-drawer.component';
import { ConfirmModalComponent } from '../../../../../shared/components/confirm-modal/confirm-modal.component';
import { AuthService } from '../../../../../services/auth.service';
import { ConsentimientoRgpdBackend } from '../../../../../interface/cliente-backend.interface';
import { finalize } from 'rxjs';

export const TEXTO_CONSENTIMIENTO = `Don/Doña _______________, en calidad de padre/madre/tutor legal del menor, \
CONSIENTE expresamente el tratamiento de los datos de salud del menor por parte del gabinete, \
con la finalidad de prestar servicios de atención terapéutica y pedagógica, conforme al Art. 9.2.a \
del Reglamento (UE) 2016/679 (RGPD) y el Art. 7 de la LOPD-GDD 3/2018. El responsable del tratamiento \
conservará estos datos durante el tiempo de prestación del servicio y el mínimo legal posterior (Ley 41/2002). \
Puede ejercer sus derechos de acceso, rectificación, supresión, portabilidad y oposición en la dirección \
del gabinete o consultando la Política de Privacidad de la aplicación.`;

export const VERSION_TEXTO = 'v1.0-2026-04';

@Component({
  standalone: true,
  selector: 'app-perfil-tab',
  imports: [CommonModule, FormsModule, ClienteDrawerComponent, ConfirmModalComponent],
  templateUrl: './perfil-tab.component.html',
})
export class PerfilTabComponent implements OnInit {
  private route       = inject(ActivatedRoute);
  readonly clientesSvc = inject(ClientesService);
  private drawerSvc   = inject(DrawerService);
  readonly auth       = inject(AuthService);

  @ViewChild(ClienteDrawerComponent) drawer!: ClienteDrawerComponent;

  readonly cliente      = this.clientesSvc.cliente;
  readonly clienteRaw   = this.clientesSvc.clienteRaw;
  readonly familiares   = this.clientesSvc.contactosFamiliares;
  readonly colegio      = this.clientesSvc.colegio;
  readonly sanitario    = this.clientesSvc.sanitario;

  // ── Sección Facturación (datos pagador) ─────────────
  editandoPagador    = signal(false);
  guardandoPagador   = signal(false);
  exitoPagador       = signal(false);
  errorPagador       = signal<string | null>(null);

  pagadorForm = signal({
    nifTutorPagador:      '',
    nombreTutorPagador:   '',
    direccionFiscalTutor: '',
    codigoPostalTutor:    '',
    ciudadTutor:          '',
    emailFacturacion:     '',
  });

  abrirEditarPagador(): void {
    const raw = this.clienteRaw();
    this.pagadorForm.set({
      nifTutorPagador:      raw?.nifTutorPagador      ?? '',
      nombreTutorPagador:   raw?.nombreTutorPagador   ?? '',
      direccionFiscalTutor: raw?.direccionFiscalTutor ?? '',
      codigoPostalTutor:    raw?.codigoPostalTutor    ?? '',
      ciudadTutor:          raw?.ciudadTutor           ?? '',
      emailFacturacion:     raw?.emailFacturacion      ?? '',
    });
    this.errorPagador.set(null);
    this.editandoPagador.set(true);
  }

  cancelarEditarPagador(): void {
    this.editandoPagador.set(false);
  }

  guardarPagador(): void {
    this.guardandoPagador.set(true);
    this.errorPagador.set(null);
    this.clientesSvc.updateDatosPagador(this.clienteId, this.pagadorForm())
      .pipe(finalize(() => this.guardandoPagador.set(false)))
      .subscribe({
        next: () => {
          this.editandoPagador.set(false);
          this.exitoPagador.set(true);
          this.clientesSvc.loadAll(this.clienteId).subscribe();
          setTimeout(() => this.exitoPagador.set(false), 3000);
        },
        error: (err: any) => {
          this.errorPagador.set(err?.error?.message ?? 'Error al guardar los datos del pagador');
        },
      });
  }

  patchPagador<K extends keyof ReturnType<typeof this.pagadorForm>>(k: K, v: string): void {
    this.pagadorForm.update(f => ({ ...f, [k]: v }));
  }

  // ── RGPD legacy ────────────────────────────────────
  guardandoRgpd = signal(false);
  errorRgpd     = signal<string | null>(null);
  exportando    = signal(false);

  // ── Consentimiento nuevo ────────────────────────────
  historico             = signal<ConsentimientoRgpdBackend[]>([]);
  cargandoHistorico     = signal(false);
  mostrarHistorial      = signal(false);
  mostrarForm           = signal(false);
  familiarSeleccionado  = signal('');
  checkAceptado         = signal(false);
  guardandoConsentimiento = signal(false);
  errorConsentimiento   = signal<string | null>(null);
  mostrarConfirmRevocar = signal(false);

  readonly textoConsentimiento = TEXTO_CONSENTIMIENTO;
  readonly versionTexto        = VERSION_TEXTO;

  get clienteId(): string {
    return this.route.parent?.snapshot.paramMap.get('id') ?? '';
  }

  ngOnInit(): void {
    this.cargarHistorico();
  }

  // ── Drawer ──────────────────────────────────────────
  openDrawer(section: DrawerSection): void {
    this.drawerSvc.open(section, this.clienteId);
    setTimeout(() => this.drawer?.onDrawerOpened(section), 0);
  }

  // ── Historial ───────────────────────────────────────
  cargarHistorico(): void {
    this.cargandoHistorico.set(true);
    this.clientesSvc.getHistoricoConsentimientos(this.clienteId).subscribe({
      next: (data) => {
        this.historico.set(data);
        this.cargandoHistorico.set(false);
      },
      error: () => this.cargandoHistorico.set(false),
    });
  }

  toggleHistorial(): void {
    this.mostrarHistorial.update(v => !v);
  }

  // ── Formulario ──────────────────────────────────────
  abrirForm(): void {
    this.familiarSeleccionado.set('');
    this.checkAceptado.set(false);
    this.errorConsentimiento.set(null);
    this.mostrarForm.set(true);
  }

  cancelarForm(): void {
    this.mostrarForm.set(false);
  }

  confirmarConsentimiento(): void {
    if (!this.familiarSeleccionado() || !this.checkAceptado()) return;
    this.guardandoConsentimiento.set(true);
    this.errorConsentimiento.set(null);

    this.clientesSvc.registrarConsentimiento(this.clienteId, {
      familiarId: this.familiarSeleccionado(),
      aceptado: true,
      versionTexto: this.versionTexto,
      textoConsentimiento: this.textoConsentimiento,
    }).subscribe({
      next: () => {
        this.guardandoConsentimiento.set(false);
        this.mostrarForm.set(false);
        this.clientesSvc.loadAll(this.clienteId).subscribe();
        this.cargarHistorico();
      },
      error: (err) => {
        this.guardandoConsentimiento.set(false);
        this.errorConsentimiento.set(err?.error?.message ?? 'Error al registrar el consentimiento');
      },
    });
  }

  // ── Revocar ─────────────────────────────────────────
  abrirConfirmRevocar(): void {
    this.mostrarConfirmRevocar.set(true);
  }

  cancelarRevocar(): void {
    this.mostrarConfirmRevocar.set(false);
  }

  confirmarRevocar(): void {
    const ultimoConsentimiento = this.historico().find(c => c.aceptado);
    if (!ultimoConsentimiento) return;

    this.mostrarConfirmRevocar.set(false);
    this.guardandoConsentimiento.set(true);

    this.clientesSvc.registrarConsentimiento(this.clienteId, {
      familiarId: ultimoConsentimiento.familiar.id,
      aceptado: false,
      versionTexto: this.versionTexto,
      textoConsentimiento: this.textoConsentimiento,
    }).subscribe({
      next: () => {
        this.guardandoConsentimiento.set(false);
        this.clientesSvc.loadAll(this.clienteId).subscribe();
        this.cargarHistorico();
      },
      error: () => this.guardandoConsentimiento.set(false),
    });
  }

  // ── Export RGPD ─────────────────────────────────────
  exportarDatosRgpd(): void {
    const raw = this.clienteRaw();
    const nombre = raw ? `${raw.nombre}_${raw.apellidos}` : this.clienteId;
    this.exportando.set(true);
    this.clientesSvc.exportarDatos(this.clienteId, nombre).subscribe({
      next: () => this.exportando.set(false),
      error: () => this.exportando.set(false),
    });
  }

  // ── Helpers ─────────────────────────────────────────
  // ngModel bridge para el signal de select
  get familiarSeleccionadoModel(): string { return this.familiarSeleccionado(); }
  set familiarSeleccionadoModel(v: string) { this.familiarSeleccionado.set(v); }

  get ultimoConsentimientoActivo(): ConsentimientoRgpdBackend | undefined {
    return this.historico().find(c => c.aceptado);
  }

  get tieneConsentimientoActivo(): boolean {
    return !!this.ultimoConsentimientoActivo;
  }
}

export default PerfilTabComponent;
