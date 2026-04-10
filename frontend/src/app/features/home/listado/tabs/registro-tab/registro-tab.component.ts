import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
  signal,
  type OnInit,
} from '@angular/core';
import { DomSanitizer, SecurityContext } from '@angular/platform-browser';
import { RegistrosService } from '../../../../../services/registros.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TiptapEditorComponent } from '../../../../../components/tiptap-editor/tiptap-editor.component';
import { ClientesService } from '../../../../../services/cliente.service';
import { ActivatedRoute } from '@angular/router';
import { TextCleanerService } from '../../../../../shared/utils/text-cleaner.service';
import { CreateRegistroDiarioDto, RegistroDiario } from '../../../../../interface/registro-diario.interface';

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
  private sanitizer = inject(DomSanitizer);

  sanitizeHtml(html: string): string {
    return this.sanitizer.sanitize(SecurityContext.HTML, html) ?? '';
  }

  hoy = new Date();
  nuevoContenido = signal('');
  cargando = signal(false);
  filtro = signal('Todo');
  clienteId = signal<string>('');

  objetivosNotasMap = signal<Record<string, string>>({});
  mostrarObjetivos = signal(false);
  editandoId = signal<string | null>(null);

  // Registros y objetivos del cliente
  registros = this.fichajeSvc.registros;
  objetivosCliente = this.clientesSvc.objetivos;

  // Computed para agrupar objetivos por área
  objetivosAgrupados = computed(() => {
    const objetivos = this.objetivosCliente()?.objetivos || [];

    const grupos = new Map<string, any[]>();
    objetivos.forEach((obj) => {
      if (!grupos.has(obj.area)) {
        grupos.set(obj.area, []);
      }
      grupos.get(obj.area)!.push(obj);
    });

    return Array.from(grupos.entries()).map(([area, objs]) => ({
      area,
      color: objs[0]?.color || '#6c757d',
      objetivos: objs,
    }));
  });

  registrosFiltrados = computed(() => {
    const list = this.registros();
    const filtroActual = this.filtro();
    const now = new Date();

    if (filtroActual === 'Todo') return list;

    return list.filter((r) => {
      const fecha = new Date(r.fechaRegistro);

      if (filtroActual === 'Hoy') {
        return fecha.toDateString() === now.toDateString();
      }

      if (filtroActual === 'Semana') {
        const sieteDiasAtras = new Date().setDate(now.getDate() - 7);
        return fecha.getTime() >= sieteDiasAtras;
      }

      if (filtroActual === 'Mes') {
        return (
          fecha.getMonth() === now.getMonth() &&
          fecha.getFullYear() === now.getFullYear()
        );
      }

      return true;
    });
  });

  objetivosSeleccionadosCount = computed(() => Object.keys(this.objetivosNotasMap()).length);

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
    if (!id) {
      console.error('No se pudo encontrar el ID del cliente');
      return;
    }

    this.fichajeSvc.getRegistrosByCliente(id).subscribe({
      next: () => console.log('✅ Registros cargados'),
      error: (err) => console.error('❌ Error al cargar registros:', err),
    });
  }

  getObjetivosCliente() {
    const id = this.clienteId();
    if (!id) return;

    this.clientesSvc.getObjetivosCliente(id).subscribe({
      next: () => console.log('✅ Objetivos del cliente cargados'),
      error: (err) => console.error('❌ Error al cargar objetivos:', err),
    });
  }

  // Toggle: añadir con notas vacías o eliminar del mapa
  toggleObjetivo(objetivoId: string) {
    this.objetivosNotasMap.update((prev) => {
      const next = { ...prev };
      if (objetivoId in next) {
        delete next[objetivoId];
      } else {
        next[objetivoId] = '';
      }
      return next;
    });
  }

  // Actualizar las notas de un objetivo concreto
  setNotasObjetivo(objetivoId: string, notas: string) {
    this.objetivosNotasMap.update((prev) => ({ ...prev, [objetivoId]: notas }));
  }

  // Verificar si un objetivo está seleccionado
  esObjetivoSeleccionado(objetivoId: string): boolean {
    return objetivoId in this.objetivosNotasMap();
  }

  editarRegistro(reg: RegistroDiario): void {
    this.editandoId.set(reg.id!);
    this.nuevoContenido.set(reg.contenido);

    const map: Record<string, string> = {};
    for (const obj of reg.objetivosGeneralesTrabajados ?? []) {
      map[obj.objetivoGeneral.id] = obj.notasRegistro ?? '';
    }
    this.objetivosNotasMap.set(map);
    this.mostrarObjetivos.set(Object.keys(map).length > 0);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.nuevoContenido.set('');
    this.objetivosNotasMap.set({});
    this.mostrarObjetivos.set(false);
  }

  async guardar() {
    const html = this.nuevoContenido() ?? '';
    const textoPlano =
      new DOMParser()
        .parseFromString(html, 'text/html')
        .body.textContent?.trim() ?? '';

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

    const idEditando = this.editandoId();

    if (idEditando) {
      this.fichajeSvc.updateRegistro(idEditando, {
        contenido: this.cleaner.sanitizeInput(this.nuevoContenido()),
        objetivosGeneralesTrabajados: objetivos.length > 0 ? objetivos : [],
      }).subscribe({
        next: () => {
          this.editandoId.set(null);
          this.nuevoContenido.set('');
          this.objetivosNotasMap.set({});
          this.mostrarObjetivos.set(false);
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
        objetivosGeneralesTrabajados: objetivos.length > 0 ? objetivos : undefined,
      };

      this.fichajeSvc.createRegistro(nuevo).subscribe({
        next: () => {
          this.nuevoContenido.set('');
          this.objetivosNotasMap.set({});
          this.mostrarObjetivos.set(false);
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
    this.nuevoContenido.set('');
    this.objetivosNotasMap.set({});
  }
}
export default RegistroTabComponent;
