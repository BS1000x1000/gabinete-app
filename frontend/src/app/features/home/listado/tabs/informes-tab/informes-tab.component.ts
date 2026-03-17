import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ConfirmModalComponent } from '../../../../../shared/components/confirm-modal/confirm-modal.component';
import { ActivatedRoute } from '@angular/router';
import { formatearFechaCorta } from '../../../../../shared/utils/date';
import { ClientesService } from '../../../../../services/cliente.service';
import { InformesService } from '../../../../../services/informes.service';
import { GasService } from '../../../../../services/gas.service';
import {
  TIPO_INFORME_LABELS,
  ESTADO_INFORME_LABELS,
  TipoInforme,
  SeccionInforme,
  SECCIONES_INICIAL,
  SECCIONES_SEGUIMIENTO,
  CreateInformeDto,
  Informe,
  UpdateInformeDto,
} from '../../../../../interface/informes.interface';

@Component({
  standalone: true,
  selector: 'app-informes-tab',
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './informes-tab.component.html',
})
export default class InformesTabComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private clientesSvc = inject(ClientesService);
  private informesSvc = inject(InformesService);
  private gasSvc = inject(GasService);

  // Constantes para la template
  readonly TIPO_LABELS = TIPO_INFORME_LABELS;
  readonly ESTADO_LABELS = ESTADO_INFORME_LABELS;
  readonly TIPOS: TipoInforme[] = ['INICIAL', 'SEGUIMIENTO'];

  // Estado
  clienteId = signal<string>('');
  cargando = signal(false);
  guardando = signal(false);
  enviando = signal(false);
  descargandoPdf = signal(false);

  // Signals del servicio
  informes = this.informesSvc.informes;
  informeActivo = this.informesSvc.informeActivo;

  // Vista: 'lista' | 'editor'
  vista = signal<'lista' | 'editor'>('lista');

  // Formulario nuevo informe (INICIAL / SEGUIMIENTO)
  formNuevo = signal<{
    titulo: string;
    tipoInforme: TipoInforme;
    periodoDesde: string;
    periodoHasta: string;
  }>({
    titulo: '',
    tipoInforme: 'INICIAL',
    periodoDesde: '',
    periodoHasta: '',
  });
  mostrarFormNuevo = signal(false);

  // Formulario generar informe de sesiones (REGISTROS)
  formBorrador = signal<{ desde: string; hasta: string }>({ desde: '', hasta: '' });
  mostrarFormBorrador = signal(false);

  pendingAction = signal<(() => void) | null>(null);
  confirmTitle  = signal('');
  confirmMsg    = signal('');

  // Secciones del editor según tipo (solo INICIAL / SEGUIMIENTO)
  secciones = computed<SeccionInforme[]>(() => {
    const informe = this.informeActivo();
    if (!informe || informe.tipoInforme === 'REGISTROS') return [];
    return informe.tipoInforme === 'INICIAL'
      ? SECCIONES_INICIAL
      : SECCIONES_SEGUIMIENTO;
  });

  // Snapshot GAS parseado del informe activo
  snapshotGAS = computed(() => {
    const informe = this.informeActivo();
    if (!informe?.objetivosSnapshotJson) return [];
    try {
      return JSON.parse(informe.objetivosSnapshotJson);
    } catch {
      return [];
    }
  });

  // Texto de cada sección en el editor (INICIAL / SEGUIMIENTO)
  textosSecciones = signal<Record<string, string>>({});

  // Texto del contenido libre (REGISTROS)
  textoContenido = signal<string>('');

  // Sección activa en el editor
  seccionActiva = signal<string | null>(null);

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.clienteId.set(id);
        this.cargarInformes();
        this.clientesSvc.getObjetivosCliente(id).subscribe();
      }
    });
  }

  // ============================================================
  // CARGAR
  // ============================================================

  cargarInformes(): void {
    this.cargando.set(true);
    this.informesSvc.getInformesByCliente(this.clienteId()).subscribe({
      next: () => this.cargando.set(false),
      error: () => this.cargando.set(false),
    });
  }

  // ============================================================
  // CREAR INFORME (INICIAL / SEGUIMIENTO)
  // ============================================================

  abrirFormNuevo(): void {
    this.mostrarFormBorrador.set(false);
    this.formNuevo.set({ titulo: '', tipoInforme: 'INICIAL', periodoDesde: '', periodoHasta: '' });
    this.mostrarFormNuevo.set(true);
  }

  setTipoInforme(tipo: TipoInforme): void {
    this.formNuevo.update((f) => ({ ...f, tipoInforme: tipo }));
  }

  setFormField(field: string, value: string): void {
    this.formNuevo.update((f) => ({ ...f, [field]: value }));
  }

  crearInforme(): void {
    const form = this.formNuevo();
    if (!form.titulo.trim()) return;

    const dto: CreateInformeDto = {
      titulo: form.titulo,
      tipoInforme: form.tipoInforme,
      clienteId: this.clienteId(),
      ...(form.tipoInforme === 'SEGUIMIENTO' && form.periodoDesde ? { periodoDesde: form.periodoDesde } : {}),
      ...(form.tipoInforme === 'SEGUIMIENTO' && form.periodoHasta ? { periodoHasta: form.periodoHasta } : {}),
    };

    this.guardando.set(true);
    this.informesSvc.create(dto).subscribe({
      next: (informe) => {
        this.guardando.set(false);
        this.mostrarFormNuevo.set(false);
        this.abrirEditor(informe);
      },
      error: () => this.guardando.set(false),
    });
  }

  // ============================================================
  // GENERAR INFORME DE SESIONES (REGISTROS)
  // ============================================================

  abrirFormBorrador(): void {
    this.mostrarFormNuevo.set(false);
    this.formBorrador.set({ desde: '', hasta: '' });
    this.mostrarFormBorrador.set(true);
  }

  setBorradorField(field: 'desde' | 'hasta', value: string): void {
    this.formBorrador.update((f) => ({ ...f, [field]: value }));
  }

  generarBorrador(): void {
    const { desde, hasta } = this.formBorrador();
    if (!desde || !hasta) return;

    this.guardando.set(true);
    this.informesSvc.generarBorradorRegistros(this.clienteId(), desde, hasta).subscribe({
      next: (informe) => {
        this.guardando.set(false);
        this.mostrarFormBorrador.set(false);
        this.abrirEditor(informe);
      },
      error: () => this.guardando.set(false),
    });
  }

  // ============================================================
  // EDITOR
  // ============================================================

  abrirEditor(informe: Informe): void {
    this.informesSvc.informeActivo.set(informe);

    if (informe.tipoInforme === 'REGISTROS') {
      this.textoContenido.set(informe.contenido ?? '');
    } else {
      const textos: Record<string, string> = {};
      const secciones = informe.tipoInforme === 'INICIAL' ? SECCIONES_INICIAL : SECCIONES_SEGUIMIENTO;
      secciones.forEach((s) => { textos[s.key] = (informe as any)[s.key] ?? ''; });
      this.textosSecciones.set(textos);
      this.seccionActiva.set(secciones[0]?.key ?? null);
    }

    this.vista.set('editor');
  }

  volverALista(): void {
    this.vista.set('lista');
    this.informesSvc.informeActivo.set(null);
    this.seccionActiva.set(null);
  }

  setSeccionActiva(key: string): void {
    this.seccionActiva.set(key);
  }

  setTextoSeccion(key: string, valor: string): void {
    this.textosSecciones.update((t) => ({ ...t, [key]: valor }));
  }

  // Autoguardado secciones (INICIAL / SEGUIMIENTO)
  guardarSeccion(): void {
    const informe = this.informeActivo();
    if (!informe || this.esBloqueado()) return;

    const textos = this.textosSecciones();
    const dto: UpdateInformeDto = {};
    this.secciones().forEach((s) => { (dto as any)[s.key] = textos[s.key] ?? ''; });

    this.guardando.set(true);
    this.informesSvc.update(informe.id, dto).subscribe({
      next: () => this.guardando.set(false),
      error: () => this.guardando.set(false),
    });
  }

  cambiarSeccion(key: string): void {
    this.guardarSeccion();
    this.seccionActiva.set(key);
  }

  // Guardar contenido libre (REGISTROS)
  guardarContenido(): void {
    const informe = this.informeActivo();
    if (!informe || this.esBloqueado()) return;

    this.guardando.set(true);
    this.informesSvc.update(informe.id, { contenido: this.textoContenido() }).subscribe({
      next: () => this.guardando.set(false),
      error: () => this.guardando.set(false),
    });
  }

  // Enviar informe a la familia (REGISTROS)
  confirmarEnvio(): void {
    const informe = this.informeActivo();
    if (!informe) return;
    this.confirmTitle.set('Enviar informe a la familia');
    this.confirmMsg.set('Se enviará un email a la familia con el contenido actual. Esta acción no se puede deshacer.');
    this.pendingAction.set(() => {
      this.enviando.set(true);
      // Primero guardar el contenido actual, luego enviar
      this.informesSvc.update(informe.id, { contenido: this.textoContenido() }).subscribe({
        next: () => {
          this.informesSvc.enviarInformeAFamilia(informe.id).subscribe({
            next: () => this.enviando.set(false),
            error: () => this.enviando.set(false),
          });
        },
        error: () => this.enviando.set(false),
      });
    });
  }

  // ============================================================
  // FINALIZAR / ELIMINAR
  // ============================================================

  finalizarInforme(): void {
    const informe = this.informeActivo();
    if (!informe) return;
    this.confirmTitle.set('Finalizar informe');
    this.confirmMsg.set('No podrás editarlo después de finalizarlo.');
    this.pendingAction.set(() => {
      this.guardando.set(true);
      const textos = this.textosSecciones();
      const dto: UpdateInformeDto = {};
      this.secciones().forEach((s) => { (dto as any)[s.key] = textos[s.key] ?? ''; });
      this.informesSvc.update(informe.id, dto).subscribe({
        next: () => {
          this.informesSvc.finalizar(informe.id).subscribe({
            next: () => this.guardando.set(false),
            error: () => this.guardando.set(false),
          });
        },
        error: () => this.guardando.set(false),
      });
    });
  }

  eliminarInforme(id: string, event: Event): void {
    event.stopPropagation();
    this.confirmTitle.set('Eliminar informe');
    this.confirmMsg.set('Esta acción no se puede deshacer.');
    this.pendingAction.set(() => this.informesSvc.delete(id).subscribe());
  }

  onConfirmado() { this.pendingAction()?.(); this.pendingAction.set(null); }
  onCancelado()  { this.pendingAction.set(null); }

  // ============================================================
  // HELPERS
  // ============================================================

  descargarPdf(): void {
    const informe = this.informeActivo();
    if (!informe || this.descargandoPdf()) return;
    this.descargandoPdf.set(true);
    this.informesSvc.descargarPdf(informe.id, informe.titulo)
      .pipe(finalize(() => this.descargandoPdf.set(false)))
      .subscribe();
  }

  esBloqueado  = computed(() => { const e = this.informeActivo()?.estado; return e === 'FINALIZADO' || e === 'ENVIADO'; });
  esFinalizado = computed(() => this.informeActivo()?.estado === 'FINALIZADO');
  esEnviado    = computed(() => this.informeActivo()?.estado === 'ENVIADO');
  esRegistros  = computed(() => this.informeActivo()?.tipoInforme === 'REGISTROS');

  getTextoSeccion(key: string): string {
    return this.textosSecciones()[key] ?? '';
  }

  getNivelShort(nivel: number | null): string {
    if (nivel === null) return '—';
    return (
      ({ [-2]: '-2', [-1]: '-1', [0]: '0', [1]: '+1', [2]: '+2' } as any)[nivel] ?? `${nivel}`
    );
  }

  formatearFecha(iso: string | null | undefined): string {
    if (!iso) return '—';
    return formatearFechaCorta(iso);
  }
}
