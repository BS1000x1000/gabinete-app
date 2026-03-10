import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
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
import { CreateRegistroDiarioDto } from '../../../../../interface/registro-diario.interface';

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

  hoy = new Date();
  nuevoContenido = signal('');
  cargando = signal(false);
  filtro = signal('Todo');
  clienteId = signal<string>('');

  // ✅ NUEVO: Objetivos seleccionados para marcar como trabajados
  objetivosSeleccionados = signal<string[]>([]);
  mostrarObjetivos = signal(false);

  // Registros y objetivos del cliente
  registros = this.fichajeSvc.registros;
  objetivosCliente = this.clientesSvc.objetivos;

  // ✅ NUEVO: Computed para agrupar objetivos por área
  objetivosAgrupados = computed(() => {
    const objetivos = this.objetivosCliente()?.objetivos || [];

    // Agrupar por área
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

  // ✅ NUEVO: Toggle de objetivo seleccionado
  toggleObjetivo(objetivoId: string) {
    this.objetivosSeleccionados.update((prev) => {
      if (prev.includes(objetivoId)) {
        return prev.filter((id) => id !== objetivoId);
      } else {
        return [...prev, objetivoId];
      }
    });
  }

  // ✅ NUEVO: Verificar si un objetivo está seleccionado
  esObjetivoSeleccionado(objetivoId: string): boolean {
    console.log(objetivoId);
    return this.objetivosSeleccionados().includes(objetivoId);
  }

  async guardar() {
    // Tiptap emite '<p></p>' cuando está vacío; DOMParser extrae el texto real de forma segura
    const html = this.nuevoContenido() ?? '';
    const textoPlano = new DOMParser()
      .parseFromString(html, 'text/html')
      .body.textContent?.trim() ?? '';

    if (!textoPlano) {
      alert('Por favor, escribe el contenido del registro');
      return;
    }

    this.cargando.set(true);
    console.log(this.objetivosSeleccionados());
    const nuevo: CreateRegistroDiarioDto = {
      clienteId: this.clienteId(),
      contenido: this.cleaner.sanitizeInput(this.nuevoContenido()),
      // ✅ NUEVO: Incluir objetivos trabajados
      objetivosGeneralesTrabajados:
        this.objetivosSeleccionados().length > 0
          ? this.objetivosSeleccionados()
          : undefined,
    };
    console.log(nuevo);
    this.fichajeSvc.createRegistro(nuevo).subscribe({
      next: () => {
        this.nuevoContenido.set('');
        this.objetivosSeleccionados.set([]); // ✅ Limpiar selección
        this.mostrarObjetivos.set(false);
        this.cargando.set(false);
        console.log('✅ Registro guardado con objetivos');
      },
      error: (err) => {
        console.error('❌ Error al guardar registro:', err);
        this.cargando.set(false);
        alert('Error al guardar el registro');
      },
    });
  }

  limpiar() {
    this.nuevoContenido.set('');
    this.objetivosSeleccionados.set([]);
  }
}
export default RegistroTabComponent;
