import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ConfirmModalComponent } from '../../../../../shared/components/confirm-modal/confirm-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { formatearFechaCorta } from '../../../../../shared/utils/date';
import { ClientesService } from '../../../../../services/cliente.service';
import { InformesService } from '../../../../../services/informes.service';
import {
  TIPO_INFORME_LABELS,
  ESTADO_INFORME_LABELS,
  TipoInforme,
  EstadoInforme,
  SeccionInforme,
  SECCIONES_INICIAL,
  SECCIONES_SEGUIMIENTO,
  SECCIONES_ALTA,
  SECCION_GAS_KEY,
  CreateInformeDto,
  Informe,
  UpdateInformeDto,
} from '../../../../../interface/informes.interface';
import { DocumentosService } from '../../../../../services/documentos.service';
import {
  CategoriaDocumento,
  DocumentoCliente,
  CATEGORIA_DOCUMENTO_LABELS,
  CATEGORIAS_DOCUMENTO,
  MIME_TYPES_PERMITIDOS,
  TAMANO_MAX_BYTES,
  iconoPorMime,
  formatearTamano,
} from '../../../../../interface/documentos.interface';
import {
  ExpedienteService,
  EstadoExpediente,
  FilaExpediente as FilaExpedienteInicial,
} from '../../../../../services/expediente.service';

/** Origen de una fila del expediente: generada por la app o subida por un profesional. */
export type OrigenFila = 'informe' | 'documento';

/** Fila normalizada: informes y documentos externos comparten esta forma en la tabla. */
export interface FilaDocumento {
  id: string;
  origen: OrigenFila;
  nombre: string;
  categoriaKey: string;
  categoriaLabel: string;
  categoriaColor: string;
  icono: string;
  estado?: EstadoInforme;
  fecha: string;
  autor: string;
  /** Línea secundaria: período del informe o tamaño del fichero. */
  detalle: string;
  informe?: Informe;
  documento?: DocumentoCliente;
}

interface FilaExpediente {
  informes: FilaDocumento[];
  externos: FilaDocumento[];
  todas: FilaDocumento[];
}

/** Color por categoría de documento externo — alineado con la paleta de _variables.scss. */
const COLOR_CATEGORIA: Record<CategoriaDocumento, string> = {
  INFORME_MEDICO:  '#e11d48',
  INFORME_ESCOLAR: '#0891b2',
  ADMINISTRATIVO:  '#556d62',
  OTROS:           '#2d4a3e',
  // Expediente inicial
  CONTRATO:                 '#8a6018',
  CONSENTIMIENTO_INFORMADO: '#345c6b',
  CONSENTIMIENTO_DATOS:     '#2f6b43',
};

/** Como se pinta cada estado de firma en el panel del expediente. */
export const ESTADO_FIRMA_LABELS: Record<string, { texto: string; clase: string }> = {
  GENERADO: { texto: 'Generado', clase: 'is-generado' },
  ENVIADO:  { texto: 'Enviado',  clase: 'is-enviado' },
  FIRMADO:  { texto: 'Firmado',  clase: 'is-firmado' },
};

/** Saca el mensaje que manda el backend, que suele ser el util. */
function mensajeError(err: any): string {
  return (
    err?.error?.message ??
    err?.message ??
    'No se ha podido completar la operación.'
  );
}

function nombreCorto(p?: { nombre?: string; apellidos?: string } | null): string {
  if (!p?.nombre) return '—';
  const inicial = p.apellidos?.charAt(0);
  return inicial ? `${p.nombre} ${inicial}.` : p.nombre;
}

function periodoTexto(desde?: string | null, hasta?: string | null): string {
  if (!desde || !hasta) return '';
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
  return `${fmt(desde)} — ${fmt(hasta)}`;
}

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
  private documentosSvc = inject(DocumentosService);

  // Constantes para la template
  readonly TIPO_LABELS = TIPO_INFORME_LABELS;
  readonly ESTADO_LABELS = ESTADO_INFORME_LABELS;
  readonly TIPOS: TipoInforme[] = ['INICIAL', 'SEGUIMIENTO', 'ALTA'];

  // Estado
  clienteId = signal<string>('');
  cargando = signal(false);
  guardando = signal(false);
  enviando = signal(false);
  descargandoPdf = signal(false);
  abriendo = signal(false);

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

  // Formulario generar informe de progreso de objetivos (OBJETIVOS_PROGRESO)
  formObjetivos = signal<{ desde: string; hasta: string }>({ desde: '', hasta: '' });
  mostrarFormObjetivos = signal(false);

  pendingAction = signal<(() => void) | null>(null);
  confirmTitle  = signal('');
  confirmMsg    = signal('');

  // Secciones del editor según tipo (INICIAL / SEGUIMIENTO / ALTA)
  secciones = computed<SeccionInforme[]>(() => {
    const informe = this.informeActivo();
    if (!informe || informe.tipoInforme === 'REGISTROS' || informe.tipoInforme === 'OBJETIVOS_PROGRESO') return [];
    return this.getSeccionesParaTipo(informe.tipoInforme);
  });

  // Número de la sección GAS dentro del informe (0 si el tipo no la incluye)
  numeroSeccionGas = computed(() => this.secciones().findIndex((s) => s.key === SECCION_GAS_KEY) + 1);

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

  // ── Expediente inicial (contrato + 2 consentimientos) ──────
  private expedienteSvc = inject(ExpedienteService);
  private router = inject(Router);

  readonly ESTADO_FIRMA_LABELS = ESTADO_FIRMA_LABELS;
  expediente = signal<EstadoExpediente | null>(null);
  generandoExpediente = signal(false);
  errorExpediente = signal<string | null>(null);
  /** Documento sobre el que se esta subiendo la version firmada. */
  subiendoFirmadoDe = signal<string | null>(null);
  /** Categoría cuya vista previa se está descargando. */
  descargandoPrevia = signal<string | null>(null);
  expedientePlegado = signal(false);

  readonly hayExpediente = computed(() => {
    const e = this.expediente();
    return !!e && e.documentos.some(d => d.documentoId !== null);
  });

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.clienteId.set(id);
        this.cargarInformes();
        this.cargarDocumentos();
        this.cargarExpediente();
        this.clientesSvc.getObjetivosCliente(id).subscribe();
      }
    });
  }

  // ============================================================
  // EXPEDIENTE UNIFICADO — informes generados + documentos externos
  // ============================================================

  documentos = this.documentosSvc.documentos;

  busqueda        = signal('');
  filtroOrigen    = signal<OrigenFila | 'todos'>('todos');
  filtroCategoria = signal<string>('todos');
  ordenCampo      = signal<'fecha' | 'nombre' | 'categoria'>('fecha');
  ordenAsc        = signal(false);
  pagina          = signal(1);
  readonly POR_PAGINA = 12;

  /** Normaliza informes y documentos a una fila común para poder listarlos juntos. */
  readonly filas = computed<FilaExpediente>(() => {
    const informes: FilaDocumento[] = this.informes().map((i) => ({
      id: i.id,
      origen: 'informe',
      nombre: i.titulo,
      categoriaKey: i.tipoInforme,
      categoriaLabel: this.TIPO_LABELS[i.tipoInforme]?.texto ?? i.tipoInforme,
      categoriaColor: this.TIPO_LABELS[i.tipoInforme]?.color ?? '#556d62',
      icono: 'bi-file-earmark-text',
      estado: i.estado,
      fecha: i.createdAt,
      autor: nombreCorto(i.trabajador),
      detalle: periodoTexto(i.periodoDesde, i.periodoHasta),
      informe: i,
    }));

    const externos: FilaDocumento[] = this.documentos().map((d) => ({
      id: d.id,
      origen: 'documento',
      nombre: d.nombre,
      categoriaKey: d.categoria,
      categoriaLabel: CATEGORIA_DOCUMENTO_LABELS[d.categoria]?.texto ?? d.categoria,
      categoriaColor: COLOR_CATEGORIA[d.categoria] ?? '#556d62',
      icono: iconoPorMime(d.mimeType),
      fecha: d.fechaDocumento ?? d.createdAt,
      autor: nombreCorto(d.subidoPor),
      detalle: formatearTamano(d.tamanoBytes),
      documento: d,
    }));

    return { informes, externos, todas: [...informes, ...externos] };
  });

  readonly totalInformes  = computed(() => this.filas().informes.length);
  readonly totalDocumentos = computed(() => this.filas().externos.length);

  /** Categorías presentes en el expediente, según el origen seleccionado. */
  readonly categoriasDisponibles = computed(() => {
    const origen = this.filtroOrigen();
    const base =
      origen === 'informe'   ? this.filas().informes :
      origen === 'documento' ? this.filas().externos :
                               this.filas().todas;

    const vistas = new Map<string, { key: string; label: string; total: number }>();
    for (const f of base) {
      const actual = vistas.get(f.categoriaKey);
      if (actual) actual.total++;
      else vistas.set(f.categoriaKey, { key: f.categoriaKey, label: f.categoriaLabel, total: 1 });
    }
    return [...vistas.values()].sort((a, b) => a.label.localeCompare(b.label, 'es'));
  });

  readonly filasFiltradas = computed(() => {
    const q         = this.busqueda().trim().toLowerCase();
    const origen    = this.filtroOrigen();
    const categoria = this.filtroCategoria();
    const campo     = this.ordenCampo();
    const asc       = this.ordenAsc();

    const filtradas = this.filas().todas.filter((f) => {
      if (origen !== 'todos' && f.origen !== origen) return false;
      if (categoria !== 'todos' && f.categoriaKey !== categoria) return false;
      if (q && !f.nombre.toLowerCase().includes(q) && !f.autor.toLowerCase().includes(q)) return false;
      return true;
    });

    const dir = asc ? 1 : -1;
    return filtradas.sort((a, b) => {
      if (campo === 'nombre')    return dir * a.nombre.localeCompare(b.nombre, 'es');
      if (campo === 'categoria') return dir * a.categoriaLabel.localeCompare(b.categoriaLabel, 'es');
      return dir * (new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    });
  });

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.filasFiltradas().length / this.POR_PAGINA)),
  );

  /** Página saneada: si un filtro reduce los resultados, no queda una página vacía. */
  readonly paginaActual = computed(() => Math.min(this.pagina(), this.totalPaginas()));

  readonly filasPagina = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.POR_PAGINA;
    return this.filasFiltradas().slice(inicio, inicio + this.POR_PAGINA);
  });

  readonly rangoMostrado = computed(() => {
    const total = this.filasFiltradas().length;
    if (total === 0) return { desde: 0, hasta: 0, total };
    const desde = (this.paginaActual() - 1) * this.POR_PAGINA + 1;
    return { desde, hasta: Math.min(desde + this.POR_PAGINA - 1, total), total };
  });

  readonly hayFiltrosActivos = computed(
    () => !!this.busqueda().trim() || this.filtroOrigen() !== 'todos' || this.filtroCategoria() !== 'todos',
  );

  setOrigen(origen: OrigenFila | 'todos'): void {
    this.filtroOrigen.set(origen);
    this.filtroCategoria.set('todos'); // las categorías dependen del origen
    this.pagina.set(1);
  }

  setCategoria(key: string): void {
    this.filtroCategoria.set(key);
    this.pagina.set(1);
  }

  setBusqueda(valor: string): void {
    this.busqueda.set(valor);
    this.pagina.set(1);
  }

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.filtroOrigen.set('todos');
    this.filtroCategoria.set('todos');
    this.pagina.set(1);
  }

  ordenarPor(campo: 'fecha' | 'nombre' | 'categoria'): void {
    if (this.ordenCampo() === campo) this.ordenAsc.update((v) => !v);
    else {
      this.ordenCampo.set(campo);
      this.ordenAsc.set(campo !== 'fecha'); // texto asc por defecto, fechas desc
    }
    this.pagina.set(1);
  }

  irAPagina(n: number): void {
    this.pagina.set(Math.min(Math.max(1, n), this.totalPaginas()));
  }

  cargarDocumentos(): void {
    this.documentosSvc.getByCliente(this.clienteId()).subscribe({
      error: () => { /* el interceptor global ya muestra el error */ },
    });
  }

  // ============================================================
  // EXPEDIENTE INICIAL — contrato + los dos consentimientos
  // ============================================================

  cargarExpediente(): void {
    this.expedienteSvc.cargar(this.clienteId()).subscribe({
      next: e => this.expediente.set(e),
      error: () => { /* el interceptor global ya muestra el error */ },
    });
  }

  /**
   * Genera o regenera los tres documentos. Los ya firmados no se tocan: eso lo
   * garantiza el backend, aqui solo se refleja en el recuento.
   */
  generarExpediente(): void {
    const contratoId = this.expediente()?.contratoId;
    if (!contratoId || this.generandoExpediente()) return;

    this.generandoExpediente.set(true);
    this.errorExpediente.set(null);
    this.expedienteSvc
      .generar(contratoId)
      .pipe(finalize(() => this.generandoExpediente.set(false)))
      .subscribe({
        next: () => {
          this.cargarExpediente();
          this.cargarDocumentos();
        },
        error: err => this.errorExpediente.set(mensajeError(err)),
      });
  }

  /**
   * Descarga el documento generado al vuelo, sin guardarlo.
   *
   * Sirve para ver cómo va a quedar antes de generarlo de verdad, y es lo único
   * que funciona mientras no haya Object Storage configurado.
   */
  vistaPrevia(fila: FilaExpedienteInicial): void {
    const contratoId = this.expediente()?.contratoId;
    if (!contratoId || this.descargandoPrevia()) return;

    const nombre = `vista-previa-${fila.categoria.toLowerCase()}.pdf`;
    this.errorExpediente.set(null);
    this.descargandoPrevia.set(fila.categoria);
    this.expedienteSvc
      .descargarVistaPrevia(contratoId, fila.categoria, nombre)
      .pipe(finalize(() => this.descargandoPrevia.set(null)))
      .subscribe({
        error: err => this.errorExpediente.set(mensajeError(err)),
      });
  }

  /** Abre el PDF generado en una pestaña nueva. */
  verDocumentoExpediente(fila: FilaExpedienteInicial): void {
    if (!fila.documentoId || this.abriendo()) return;
    this.abriendo.set(true);
    this.documentosSvc
      .abrir(fila.documentoId)
      .pipe(finalize(() => this.abriendo.set(false)))
      .subscribe({ error: () => { /* interceptor */ } });
  }

  /**
   * Deja constancia de que el documento salio hacia la familia.
   *
   * De momento la terapeuta lo descarga y lo manda ella: el correo de la app
   * sale por un proveedor de EE. UU. y estos documentos llevan datos del menor.
   * Cuando se migre a Scaleway TEM, esta accion pasara a enviarlo de verdad.
   */
  marcarEnviado(fila: FilaExpedienteInicial): void {
    if (!fila.documentoId || !fila.puedeEnviar) return;
    this.errorExpediente.set(null);
    this.expedienteSvc.marcarEnviado(fila.documentoId).subscribe({
      next: () => this.cargarExpediente(),
      error: err => this.errorExpediente.set(mensajeError(err)),
    });
  }

  /** Sube el PDF que devuelve la familia firmado. */
  onFirmadoSeleccionado(fila: FilaExpedienteInicial, event: Event): void {
    const input = event.target as HTMLInputElement;
    const fichero = input.files?.[0];
    input.value = '';
    if (!fichero || !fila.documentoId) return;

    if (fichero.type !== 'application/pdf') {
      this.errorExpediente.set('El documento firmado debe ser un PDF.');
      return;
    }
    if (fichero.size > TAMANO_MAX_BYTES) {
      this.errorExpediente.set(
        `El fichero supera el máximo de ${formatearTamano(TAMANO_MAX_BYTES)}.`,
      );
      return;
    }

    this.errorExpediente.set(null);
    this.subiendoFirmadoDe.set(fila.documentoId);
    this.expedienteSvc
      .subirFirmado(fila.documentoId, fichero)
      .pipe(finalize(() => this.subiendoFirmadoDe.set(null)))
      .subscribe({
        next: () => {
          this.cargarExpediente();
          this.cargarDocumentos();
        },
        error: err => this.errorExpediente.set(mensajeError(err)),
      });
  }

  toggleExpediente(): void {
    this.expedientePlegado.update(v => !v);
  }

  /** Lleva a la pestaña de contratos, que es donde se completa lo que falta. */
  irAContratos(): void {
    this.router.navigate(['/home/listado', this.clienteId(), 'contratos']);
  }

  /** Abre el informe en el editor o el documento externo en una pestaña nueva. */
  abrirFila(fila: FilaDocumento): void {
    if (fila.origen === 'informe' && fila.informe) {
      this.abrirEditor(fila.informe);
      return;
    }
    if (this.abriendo()) return;
    this.abriendo.set(true);
    this.documentosSvc.abrir(fila.id)
      .pipe(finalize(() => this.abriendo.set(false)))
      .subscribe({ error: () => { /* interceptor global */ } });
  }

  eliminarFila(fila: FilaDocumento, event: Event): void {
    event.stopPropagation();
    if (fila.origen === 'informe') {
      this.eliminarInforme(fila.id, event);
      return;
    }
    this.confirmTitle.set('Eliminar documento');
    this.confirmMsg.set(`Se eliminará «${fila.nombre}» de forma permanente.`);
    this.pendingAction.set(() => this.documentosSvc.eliminar(fila.id).subscribe());
  }

  // ── Subida de documentos ────────────────────────────────────

  readonly CATEGORIAS = CATEGORIAS_DOCUMENTO;
  readonly CATEGORIA_LABELS = CATEGORIA_DOCUMENTO_LABELS;

  mostrarSubida = signal(false);
  subiendo      = signal(false);
  errorSubida   = signal<string | null>(null);
  ficheroSel    = signal<File | null>(null);
  arrastrando   = signal(false);
  formSubida    = signal<{ categoria: CategoriaDocumento; nombre: string; descripcion: string; fechaDocumento: string }>({
    categoria: 'INFORME_MEDICO',
    nombre: '',
    descripcion: '',
    fechaDocumento: '',
  });

  abrirSubida(): void {
    this.mostrarFormNuevo.set(false);
    this.mostrarFormBorrador.set(false);
    this.mostrarFormObjetivos.set(false);
    this.ficheroSel.set(null);
    this.errorSubida.set(null);
    this.formSubida.set({ categoria: 'INFORME_MEDICO', nombre: '', descripcion: '', fechaDocumento: '' });
    this.mostrarSubida.set(true);
  }

  cerrarSubida(): void {
    this.mostrarSubida.set(false);
    this.ficheroSel.set(null);
    this.errorSubida.set(null);
  }

  setCampoSubida(campo: string, valor: string): void {
    this.formSubida.update((f) => ({ ...f, [campo]: valor }));
  }

  onFicheroInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.seleccionarFichero(input.files?.[0] ?? null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(true);
  }

  onDragLeave(): void {
    this.arrastrando.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(false);
    this.seleccionarFichero(event.dataTransfer?.files?.[0] ?? null);
  }

  /** Valida tipo y tamaño en cliente; el backend vuelve a validarlo (nunca confiar en el cliente). */
  private seleccionarFichero(file: File | null): void {
    this.errorSubida.set(null);
    if (!file) return;

    if (!MIME_TYPES_PERMITIDOS.includes(file.type)) {
      this.errorSubida.set('Formato no admitido. Acepta PDF, imagen, Word o Excel.');
      return;
    }
    if (file.size > TAMANO_MAX_BYTES) {
      this.errorSubida.set(`El fichero supera el máximo de ${TAMANO_MAX_BYTES / (1024 * 1024)} MB.`);
      return;
    }

    this.ficheroSel.set(file);
    // Prerrellena el nombre visible con el del fichero, sin la extensión.
    if (!this.formSubida().nombre.trim()) {
      this.setCampoSubida('nombre', file.name.replace(/\.[^.]+$/, ''));
    }
  }

  confirmarSubida(): void {
    const file = this.ficheroSel();
    if (!file || this.subiendo()) return;

    const form = this.formSubida();
    this.subiendo.set(true);
    this.errorSubida.set(null);

    this.documentosSvc
      .subir(file, {
        clienteId: this.clienteId(),
        categoria: form.categoria,
        nombre: form.nombre.trim() || undefined,
        descripcion: form.descripcion.trim() || undefined,
        fechaDocumento: form.fechaDocumento || undefined,
      })
      .pipe(finalize(() => this.subiendo.set(false)))
      .subscribe({
        next: () => this.cerrarSubida(),
        error: (err) =>
          this.errorSubida.set(
            err?.error?.message ?? 'No se ha podido subir el documento. Inténtalo de nuevo.',
          ),
      });
  }

  formatearTamano = formatearTamano;

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
    this.mostrarFormObjetivos.set(false);
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

    const conPeriodo = form.tipoInforme === 'SEGUIMIENTO' || form.tipoInforme === 'ALTA';
    const dto: CreateInformeDto = {
      titulo: form.titulo,
      tipoInforme: form.tipoInforme,
      clienteId: this.clienteId(),
      ...(conPeriodo && form.periodoDesde ? { periodoDesde: form.periodoDesde } : {}),
      ...(conPeriodo && form.periodoHasta ? { periodoHasta: form.periodoHasta } : {}),
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
    const abierto = this.mostrarFormBorrador();
    this.mostrarFormNuevo.set(false);
    this.mostrarFormObjetivos.set(false);
    if (!abierto) this.formBorrador.set({ desde: '', hasta: '' });
    this.mostrarFormBorrador.set(!abierto);
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
  // GENERAR INFORME DE PROGRESO DE OBJETIVOS (OBJETIVOS_PROGRESO)
  // ============================================================

  abrirFormObjetivos(): void {
    const abierto = this.mostrarFormObjetivos();
    this.mostrarFormNuevo.set(false);
    this.mostrarFormBorrador.set(false);
    if (!abierto) this.formObjetivos.set({ desde: '', hasta: '' });
    this.mostrarFormObjetivos.set(!abierto);
  }

  setObjetivosField(field: 'desde' | 'hasta', value: string): void {
    this.formObjetivos.update((f) => ({ ...f, [field]: value }));
  }

  generarBorradorObjetivos(): void {
    const { desde, hasta } = this.formObjetivos();
    if (!desde || !hasta) return;

    this.guardando.set(true);
    this.informesSvc.generarBorradorObjetivos(this.clienteId(), desde, hasta).subscribe({
      next: (informe) => {
        this.guardando.set(false);
        this.mostrarFormObjetivos.set(false);
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

    if (informe.tipoInforme === 'REGISTROS' || informe.tipoInforme === 'OBJETIVOS_PROGRESO') {
      this.textoContenido.set(informe.contenido ?? '');
    } else {
      const textos: Record<string, string> = {};
      const secciones = this.getSeccionesParaTipo(informe.tipoInforme);
      secciones
        .filter((s) => s.key !== SECCION_GAS_KEY)
        .forEach((s) => { textos[s.key] = (informe as any)[s.key] ?? ''; });
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

  /** Solo las secciones que mapean a un campo del informe (excluye la tabla GAS). */
  private construirDtoSecciones(): UpdateInformeDto {
    const textos = this.textosSecciones();
    const dto: UpdateInformeDto = {};
    this.secciones()
      .filter((s) => s.key !== SECCION_GAS_KEY)
      .forEach((s) => { (dto as any)[s.key] = textos[s.key] ?? ''; });
    return dto;
  }

  // Autoguardado secciones (INICIAL / SEGUIMIENTO)
  guardarSeccion(): void {
    const informe = this.informeActivo();
    if (!informe || this.esBloqueado()) return;

    this.guardando.set(true);
    this.informesSvc.update(informe.id, this.construirDtoSecciones()).subscribe({
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
      this.informesSvc.update(informe.id, this.construirDtoSecciones()).subscribe({
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

  abrirPdfArchivado(): void {
    const informe = this.informeActivo();
    if (!informe || this.abriendo()) return;
    this.abriendo.set(true);
    this.informesSvc.getPdfUrl(informe.id)
      .pipe(finalize(() => this.abriendo.set(false)))
      .subscribe({
        next: (url) => window.open(url, '_blank', 'noopener'),
        error: () => { /* el interceptor global ya muestra el error */ },
      });
  }

  readonly tienePdfArchivado = computed(() => !!this.informeActivo()?.urlDocumentoFinal);

  esBloqueado         = computed(() => { const e = this.informeActivo()?.estado; return e === 'FINALIZADO' || e === 'ENVIADO'; });
  esFinalizado        = computed(() => this.informeActivo()?.estado === 'FINALIZADO');
  esEnviado           = computed(() => this.informeActivo()?.estado === 'ENVIADO');
  esRegistros         = computed(() => this.informeActivo()?.tipoInforme === 'REGISTROS');
  esObjetivosProgreso = computed(() => this.informeActivo()?.tipoInforme === 'OBJETIVOS_PROGRESO');
  esContenidoLibre    = computed(() => this.esRegistros() || this.esObjetivosProgreso());

  private getSeccionesParaTipo(tipo: TipoInforme): SeccionInforme[] {
    if (tipo === 'INICIAL') return SECCIONES_INICIAL;
    if (tipo === 'ALTA') return SECCIONES_ALTA;
    return SECCIONES_SEGUIMIENTO;
  }

  // Helpers tipados para uso en ng-template (contexto 'any')
  getTipoLabel(tipo: string): { texto: string; color: string; bg: string } {
    return this.TIPO_LABELS[tipo as TipoInforme] ?? { texto: tipo, color: '#000', bg: '#eee' };
  }

  getEstadoLabel(estado: string): { texto: string; badgeClass: string } {
    return this.ESTADO_LABELS[estado as EstadoInforme] ?? { texto: estado, badgeClass: 'bg-secondary' };
  }

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
