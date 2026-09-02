import {
  Component,
  computed,
  inject,
  signal,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientesService } from '../../../../../services/cliente.service';
import { DrawerService, DrawerSection } from '../../../../../services/drawer.service';
import { ClienteDrawerComponent } from '../../../../../shared/components/cliente-drawer/cliente-drawer.component';
import { AuthService } from '../../../../../services/auth.service';
import { ConsentimientoRgpdBackend } from '../../../../../interface/cliente-backend.interface';
import { DocumentosService } from '../../../../../services/documentos.service';
import { finalize } from 'rxjs';

/**
 * Aqui vivia el texto del consentimiento y su version, escritos a mano en el
 * frontend. Se han quitado: la familia firma el PDF que genera el backend
 * (`consentimiento-datos.template.ts`), y ese es el texto y la version que
 * quedan registrados. Tener una segunda copia aqui significaba guardar como
 * "texto aceptado" algo que la familia nunca habia visto.
 */

@Component({
  standalone: true,
  selector: 'app-perfil-tab',
  imports: [CommonModule, FormsModule, RouterLink, ClienteDrawerComponent],
  templateUrl: './perfil-tab.component.html',
})
export class PerfilTabComponent implements OnInit {
  private route       = inject(ActivatedRoute);
  readonly clientesSvc = inject(ClientesService);
  private drawerSvc   = inject(DrawerService);
  readonly auth       = inject(AuthService);
  private documentosSvc = inject(DocumentosService);

  @ViewChild(ClienteDrawerComponent) drawer!: ClienteDrawerComponent;

  readonly cliente      = this.clientesSvc.cliente;
  readonly clienteRaw   = this.clientesSvc.clienteRaw;
  readonly familiares   = this.clientesSvc.contactosFamiliares;
  readonly colegio      = this.clientesSvc.colegio;
  readonly sanitario    = this.clientesSvc.sanitario;
  readonly escolar      = this.clientesSvc.escolar;

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

  /**
   * El familiar marcado como responsable de pago, si lo hay.
   *
   * Son cosas distintas y a propósito: `esContactoPrincipal` es a quién se llama
   * primero, `esTutorLegal` quién firma, y el DESTINATARIO FISCAL vive en campos
   * propios de `Cliente` porque puede no ser ninguno de los familiares — un
   * abuelo, una empresa — y su NIF puede diferir del DNI de la ficha.
   */
  readonly responsablePago = computed(
    () => this.familiares().find((f: any) => f.esResponsablePago) ?? null,
  );

  /**
   * Copia los datos del responsable de pago al formulario fiscal.
   *
   * Es un botón y no un relleno automático: nada debe sobrescribir en silencio lo
   * que alguien ha escrito a mano. Pero teclear la misma persona dos veces es
   * justo como los dos sitios acaban divergiendo, y sin nombre y NIF la factura
   * ni siquiera se emite (`motivoSinDatosFiscales`).
   */
  copiarDelResponsablePago(): void {
    const r: any = this.responsablePago();
    if (!r) return;
    this.pagadorForm.update(f => ({
      ...f,
      nombreTutorPagador: `${r.nombre ?? ''} ${r.apellidos ?? ''}`.trim(),
      nifTutorPagador: r.dni ?? f.nifTutorPagador,
      emailFacturacion: r.email ?? f.emailFacturacion,
    }));
  }

  // ── Consentimiento RGPD ─────────────────────────────
  // El panel es de lectura: el consentimiento nace al subir el PDF firmado en
  // la pestana Documentacion. Aqui solo se consulta, se revoca y — para ADMIN —
  // se registra el papel que se firmo fuera de la app.
  exportando              = signal(false);
  historico               = signal<ConsentimientoRgpdBackend[]>([]);
  cargandoHistorico       = signal(false);
  mostrarHistorial        = signal(false);
  guardandoConsentimiento = signal(false);
  errorConsentimiento     = signal<string | null>(null);

  /** Revocacion: hace falta un motivo, asi que es un formulario, no un modal. */
  mostrarFormRevocar = signal(false);
  motivoRevocacion   = signal('');

  /** Registro manual (solo ADMIN). */
  mostrarFormManual = signal(false);
  ficheroManual     = signal<File | null>(null);
  manualForm        = signal({
    versionTexto: '',
    motivoRegistroManual: '',
    fechaFirma: '',
    autorizaInformesTerceros: false,
    autorizaCoordinacionCentro: false,
    autorizaImagenes: false,
    consentimientoMenor14: false,
  });
  /** Tutores marcados como firmantes. Pueden ser los dos. */
  firmantesManual = signal<string[]>([]);

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

  // ── Revocar ─────────────────────────────────────────
  // Quien revoca es el tutor que consintio, y eso lo resuelve el backend. Antes
  // se mandaba desde aqui un `familiar.id` que el backend nunca devolvia, asi
  // que la revocacion fallaba en silencio.
  abrirFormRevocar(): void {
    this.motivoRevocacion.set('');
    this.errorConsentimiento.set(null);
    this.mostrarFormRevocar.set(true);
  }

  cancelarRevocar(): void {
    this.mostrarFormRevocar.set(false);
  }

  confirmarRevocar(): void {
    const motivo = this.motivoRevocacion().trim();
    if (motivo.length < 5) {
      this.errorConsentimiento.set('Indica el motivo de la revocación.');
      return;
    }

    this.guardandoConsentimiento.set(true);
    this.errorConsentimiento.set(null);

    this.clientesSvc.revocarConsentimiento(this.clienteId, motivo)
      .pipe(finalize(() => this.guardandoConsentimiento.set(false)))
      .subscribe({
        next: () => {
          this.mostrarFormRevocar.set(false);
          this.clientesSvc.loadAll(this.clienteId).subscribe();
          this.cargarHistorico();
        },
        error: (err: any) => {
          this.errorConsentimiento.set(
            err?.error?.message ?? 'No se pudo registrar la revocación',
          );
        },
      });
  }

  // ── Registro manual (ADMIN) ─────────────────────────
  // Solo para el papel firmado fuera de la app: la cartera anterior, o una
  // familia que trae el documento en mano. Exige el escaneado.
  abrirFormManual(): void {
    this.ficheroManual.set(null);
    // Con un solo tutor legal no hay nada que elegir: se marca solo.
    const tutores = this.tutoresLegales();
    this.firmantesManual.set(tutores.length === 1 ? [tutores[0].id] : []);
    this.manualForm.set({
      versionTexto: '',
      motivoRegistroManual: '',
      fechaFirma: '',
      autorizaInformesTerceros: false,
      autorizaCoordinacionCentro: false,
      autorizaImagenes: false,
      consentimientoMenor14: false,
    });
    this.errorConsentimiento.set(null);
    this.mostrarFormManual.set(true);
  }

  cancelarFormManual(): void {
    this.mostrarFormManual.set(false);
  }

  patchManual<K extends keyof ReturnType<typeof this.manualForm>>(
    clave: K,
    valor: ReturnType<typeof this.manualForm>[K],
  ): void {
    this.manualForm.update(f => ({ ...f, [clave]: valor }));
  }

  /** Marca o desmarca a un tutor como firmante del documento. */
  toggleFirmanteManual(familiarId: string): void {
    this.firmantesManual.update((ids) =>
      ids.includes(familiarId)
        ? ids.filter((id) => id !== familiarId)
        : [...ids, familiarId],
    );
  }

  esFirmanteManual(familiarId: string): boolean {
    return this.firmantesManual().includes(familiarId);
  }

  onFicheroManual(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fichero = input.files?.[0] ?? null;
    if (fichero && fichero.type !== 'application/pdf') {
      this.errorConsentimiento.set('El consentimiento firmado debe ser un PDF.');
      input.value = '';
      return;
    }
    this.errorConsentimiento.set(null);
    this.ficheroManual.set(fichero);
  }

  readonly puedeGuardarManual = computed(() => {
    const f = this.manualForm();
    return (
      Boolean(this.ficheroManual()) &&
      this.firmantesManual().length > 0 &&
      f.versionTexto.trim().length > 0 &&
      f.motivoRegistroManual.trim().length >= 10
    );
  });

  /**
   * Hay dos tutores legales pero solo se ha marcado uno. Es legitimo (art. 156
   * CC presume que quien actua lo hace con el consentimiento del otro), pero
   * conviene verlo antes de guardar.
   */
  readonly avisoFirmaParcialManual = computed(
    () =>
      this.tutoresLegales().length > 1 &&
      this.firmantesManual().length === 1,
  );

  guardarManual(): void {
    const fichero = this.ficheroManual();
    if (!fichero || !this.puedeGuardarManual()) return;

    const f = this.manualForm();
    this.guardandoConsentimiento.set(true);
    this.errorConsentimiento.set(null);

    this.clientesSvc.registrarConsentimientoManual(this.clienteId, fichero, {
      firmanteIds: this.firmantesManual(),
      versionTexto: f.versionTexto.trim(),
      motivoRegistroManual: f.motivoRegistroManual.trim(),
      ...(f.fechaFirma ? { fechaFirma: new Date(f.fechaFirma).toISOString() } : {}),
      autorizaInformesTerceros: f.autorizaInformesTerceros,
      autorizaCoordinacionCentro: f.autorizaCoordinacionCentro,
      autorizaImagenes: f.autorizaImagenes,
      consentimientoMenor14: f.consentimientoMenor14,
    })
      .pipe(finalize(() => this.guardandoConsentimiento.set(false)))
      .subscribe({
        next: () => {
          this.mostrarFormManual.set(false);
          this.clientesSvc.loadAll(this.clienteId).subscribe();
          this.cargarHistorico();
        },
        error: (err: any) => {
          this.errorConsentimiento.set(
            err?.error?.message ?? 'No se pudo registrar el consentimiento',
          );
        },
      });
  }

  /** Abre el PDF firmado que acredita el consentimiento (URL prefirmada). */
  abrirDocumento(documentoId: string): void {
    this.documentosSvc.abrir(documentoId).subscribe({
      error: () => {
        this.errorConsentimiento.set('No se pudo abrir el documento firmado');
      },
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

  // ── Estado derivado ─────────────────────────────────

  /**
   * El ultimo hecho registrado, sea otorgar o revocar. El historico llega
   * ordenado de mas nuevo a mas viejo, asi que es el primero.
   *
   * Antes esto buscaba el primer registro `aceptado`, con lo que un cliente que
   * habia revocado seguia figurando como "Otorgado" para siempre.
   */
  readonly ultimoConsentimiento = computed<ConsentimientoRgpdBackend | null>(
    () => this.historico()[0] ?? null,
  );

  readonly consentimientoVigente = computed(
    () => this.ultimoConsentimiento()?.aceptado ?? false,
  );

  /** Tres estados distintos: nunca se dio, esta vigente, o se retiro. */
  readonly estadoConsentimiento = computed<'PENDIENTE' | 'OTORGADO' | 'REVOCADO'>(() => {
    const ultimo = this.ultimoConsentimiento();
    if (!ultimo) return 'PENDIENTE';
    return ultimo.aceptado ? 'OTORGADO' : 'REVOCADO';
  });

  /**
   * La plantilla del consentimiento de datos sigue sin validar (base legal y
   * plazos pendientes del dictamen). Si lo que se firmo fue un borrador, quien
   * lea la ficha tiene que verlo.
   */
  readonly firmadoSobreBorrador = computed(() => {
    const ultimo = this.ultimoConsentimiento();
    return Boolean(ultimo?.aceptado && ultimo.versionTexto?.includes('borrador'));
  });

  /** Solo un tutor legal puede consentir por un menor (LOPDGDD art. 7). */
  readonly tutoresLegales = computed(() =>
    this.familiares().filter((f: any) => f.esTutorLegal),
  );

  /**
   * El consentimiento vigente lo firmo solo uno de los dos tutores legales.
   * No invalida nada, pero es justo lo que conviene ver de un vistazo.
   */
  readonly firmadoPorUnSoloTutor = computed(() => {
    const ultimo = this.ultimoConsentimiento();
    if (!ultimo?.aceptado) return false;
    return this.tutoresLegales().length > 1 && ultimo.firmantes.length === 1;
  });
}

export default PerfilTabComponent;
