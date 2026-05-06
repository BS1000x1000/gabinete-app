import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { RegistrosService } from '../../../../../services/registros.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TiptapEditorComponent } from '../../../../../components/tiptap-editor/tiptap-editor.component';
import { ClientesService } from '../../../../../services/cliente.service';
import { ActivatedRoute } from '@angular/router';
import { TextCleanerService } from '../../../../../shared/utils/text-cleaner.service';
import { toggleInArray } from '../../../../../shared/utils/array.utils';
import {
  CreateRegistroDiarioDto,
  EtiquetaRegistro,
  ETIQUETAS_META,
  ETIQUETAS_OPCIONALES,
  RegistroDiario,
} from '../../../../../interface/registro-diario.interface';

@Component({
  standalone: true,
  selector: 'app-registro-tab',
  imports: [CommonModule, FormsModule, TiptapEditorComponent],
  templateUrl: './registro-tab.component.html',
})
export class RegistroTabComponent implements OnInit {
  private fichajeSvc = inject(RegistrosService);
  private clientesSvc = inject(ClientesService);
  private route = inject(ActivatedRoute);
  private cleaner = inject(TextCleanerService);

  readonly etiquetasMeta = ETIQUETAS_META;
  readonly etiquetasOpcionales = ETIQUETAS_OPCIONALES;
  readonly defaultEtiquetas: EtiquetaRegistro[] = ['REGISTRO_DIARIO'];

  sanitizeHtml(html: string): string {
    return this.cleaner.sanitizeHtml(html);
  }

  nuevoContenido = signal('');
  fechaEdicion = signal<string>(this.todayStr());
  proximaSesionTexto = signal<string>('');
  cargando = signal(false);
  filtro = signal('Todo');
  clienteId = signal<string>('');

  // Etiquetas para el formulario de nuevo/editar registro
  etiquetasSeleccionadas = signal<EtiquetaRegistro[]>([]);

  // Filtros del historial
  filtroEtiqueta = signal<EtiquetaRegistro | null>(null);
  filtroObjetivoId = signal<string>('');

  // Cards expandidas (Set de IDs)
  expandedIds = signal<Set<string>>(new Set());

  objetivosNotasMap = signal<Record<string, string>>({});
  mostrarObjetivos = signal(false);
  editandoId = signal<string | null>(null);

  registros = this.fichajeSvc.registros;
  objetivosCliente = this.clientesSvc.objetivos;

  objetivosAgrupados = computed(() => {
    const objetivos = this.objetivosCliente()?.objetivos || [];
    const grupos = new Map<string, any[]>();
    objetivos.forEach((obj) => {
      if (!grupos.has(obj.area)) grupos.set(obj.area, []);
      grupos.get(obj.area)!.push(obj);
    });
    return Array.from(grupos.entries()).map(([area, objs]) => ({
      area,
      color: objs[0]?.color || '#6c757d',
      objetivos: objs,
    }));
  });

  // Lista plana de todos los objetivos del cliente (para el select de filtro)
  todosLosObjetivos = computed(() => this.objetivosCliente()?.objetivos || []);

  registrosFiltrados = computed(() => {
    let list = this.registros();
    const filtroActual = this.filtro();
    const now = new Date();

    if (filtroActual !== 'Todo') {
      const semanaMs = new Date(now).setDate(now.getDate() - 7);
      list = list.filter((r) => {
        const fecha = new Date(r.fechaRegistro);
        if (filtroActual === 'Hoy') return fecha.toDateString() === now.toDateString();
        if (filtroActual === 'Semana') return fecha.getTime() >= semanaMs;
        if (filtroActual === 'Mes') return fecha.getMonth() === now.getMonth() && fecha.getFullYear() === now.getFullYear();
        return true;
      });
    }

    const et = this.filtroEtiqueta();
    if (et) list = list.filter(r => r.etiquetas?.includes(et));

    const objId = this.filtroObjetivoId();
    if (objId) list = list.filter(r =>
      r.objetivosGeneralesTrabajados?.some(o => o.objetivoGeneral.id === objId)
    );

    return list;
  });

  objetivosSeleccionadosCount = computed(() => Object.keys(this.objetivosNotasMap()).length);

  private todayStr(): string {
    return new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.clienteId.set(id);
        this.getRegistros();
        this.getObjetivosCliente();
      }
    });
  }

  getRegistros() {
    const id = this.clienteId();
    if (!id) return;
    this.fichajeSvc.getRegistrosByCliente(id).subscribe({
      error: (err) => console.error('❌ Error al cargar registros:', err),
    });
  }

  getObjetivosCliente() {
    const id = this.clienteId();
    if (!id) return;
    this.clientesSvc.getObjetivosCliente(id).subscribe({
      error: (err) => console.error('❌ Error al cargar objetivos:', err),
    });
  }

  // ── Etiquetas del formulario ─────────────────────────────────

  toggleEtiquetaForm(etiqueta: EtiquetaRegistro): void {
    this.etiquetasSeleccionadas.update(prev => toggleInArray(prev, etiqueta));
  }

  esEtiquetaSeleccionada(etiqueta: EtiquetaRegistro): boolean {
    return this.etiquetasSeleccionadas().includes(etiqueta);
  }

  // ── Expand / collapse cards ──────────────────────────────────

  toggleExpand(id: string): void {
    this.expandedIds.update(set => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  // ── Objetivos del formulario ─────────────────────────────────

  toggleObjetivo(objetivoId: string) {
    this.objetivosNotasMap.update((prev) => {
      const next = { ...prev };
      if (objetivoId in next) delete next[objetivoId];
      else next[objetivoId] = '';
      return next;
    });
  }

  setNotasObjetivo(objetivoId: string, notas: string) {
    this.objetivosNotasMap.update((prev) => ({ ...prev, [objetivoId]: notas }));
  }

  esObjetivoSeleccionado(objetivoId: string): boolean {
    return objetivoId in this.objetivosNotasMap();
  }

  // ── Edición ──────────────────────────────────────────────────

  editarRegistro(reg: RegistroDiario): void {
    this.editandoId.set(reg.id!);
    this.nuevoContenido.set(reg.contenido);
    this.fechaEdicion.set(reg.fechaRegistro.split('T')[0]);
    this.proximaSesionTexto.set(reg.proximaSesion ?? '');

    const etiquetasSinDefecto = (reg.etiquetas ?? []).filter(e => e !== 'REGISTRO_DIARIO') as EtiquetaRegistro[];
    this.etiquetasSeleccionadas.set(etiquetasSinDefecto);

    const map: Record<string, string> = {};
    for (const obj of reg.objetivosGeneralesTrabajados ?? []) {
      map[obj.objetivoGeneral.id] = obj.notasRegistro ?? '';
    }
    this.objetivosNotasMap.set(map);
    this.mostrarObjetivos.set(Object.keys(map).length > 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private resetForm(): void {
    this.nuevoContenido.set('');
    this.fechaEdicion.set(this.todayStr());
    this.proximaSesionTexto.set('');
    this.objetivosNotasMap.set({});
    this.etiquetasSeleccionadas.set([]);
    this.mostrarObjetivos.set(false);
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.resetForm();
  }

  // ── Guardar ──────────────────────────────────────────────────

  async guardar() {
    const html = this.nuevoContenido() ?? '';
    const textoPlano = new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim() ?? '';
    if (!textoPlano) {
      alert('Por favor, escribe el contenido del registro');
      return;
    }

    this.cargando.set(true);

    const map = this.objetivosNotasMap();
    const objetivos = Object.keys(map).map((id) => ({
      objetivoGeneralId: id,
      ...(map[id] ? { notasRegistro: map[id] } : {}),
    }));

    const etiquetas: EtiquetaRegistro[] = ['REGISTRO_DIARIO', ...this.etiquetasSeleccionadas()];
    const idEditando = this.editandoId();

    if (idEditando) {
      this.fichajeSvc.updateRegistro(idEditando, {
        contenido: this.cleaner.sanitizeInput(this.nuevoContenido()),
        proximaSesion: this.proximaSesionTexto() || undefined,
        fechaRegistro: this.fechaEdicion(),
        etiquetas,
        objetivosGeneralesTrabajados: objetivos.length > 0 ? objetivos : [],
      }).subscribe({
        next: () => {
          this.cancelarEdicion();
          this.cargando.set(false);
        },
        error: (err) => {
          console.error('❌ Error al actualizar registro:', err);
          this.cargando.set(false);
          alert('Error al actualizar el registro');
        },
      });
    } else {
      const nuevo: CreateRegistroDiarioDto = {
        clienteId: this.clienteId(),
        contenido: this.cleaner.sanitizeInput(this.nuevoContenido()),
        proximaSesion: this.proximaSesionTexto() || undefined,
        fechaRegistro: this.fechaEdicion(),
        etiquetas,
        objetivosGeneralesTrabajados: objetivos.length > 0 ? objetivos : undefined,
      };

      this.fichajeSvc.createRegistro(nuevo).subscribe({
        next: () => {
          this.resetForm();
          this.cargando.set(false);
        },
        error: (err) => {
          console.error('❌ Error al guardar registro:', err);
          this.cargando.set(false);
          alert('Error al guardar el registro');
        },
      });
    }
  }

  limpiar() {
    this.editandoId.set(null);
    this.resetForm();
  }
}
export default RegistroTabComponent;
