import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
  signal,
  type OnInit,
} from '@angular/core';
import { fichajeService } from '../../../../../services/fichaje.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { ClientesService } from '../../../../../services/cliente.service';
import { ActivatedRoute } from '@angular/router';
import { TextCleanerService } from '../../../../../utils/text-cleaner.service';

@Component({
  standalone: true,
  selector: 'app-fichaje-tab',
  imports: [CommonModule, FormsModule, QuillModule],
  templateUrl: './fichaje-tab.component.html',
  styleUrl: './fichaje-tab.component.scss',
})
export class FichajeTabComponent implements OnInit {
  private fichajeSvc = inject(fichajeService);
  private route = inject(ActivatedRoute);
  private cleaner = inject(TextCleanerService);

  hoy = new Date();
  nuevoContenido = signal('');
  cargando = signal(false);
  filtro = signal('Todo');
  clienteId: any = '';

  // Registros obtenidos del servicio (Signal)
  registros = this.fichajeSvc.registros;

  registrosFiltrados = computed(() => {
    const list = this.registros();
    const filtro = this.filtro();
    const now = new Date();

    if (filtro === 'Todo') return list;

    return list.filter((r) => {
      const fecha = new Date(r.fechaRegistro);
      if (filtro === 'Hoy') return fecha.toDateString() === now.toDateString();
      if (filtro === 'Semana') {
        const sieteDiasAtras = new Date().setDate(now.getDate() - 7);
        return fecha.getTime() >= sieteDiasAtras;
      }

      if (filtro === 'Mes') {
        // Esta condición es estricta: solo registros del mes actual Y año actual
        const esMismoMes = fecha.getMonth() === now.getMonth();
        const esMismoAnio = fecha.getFullYear() === now.getFullYear();

        // Solo si ambas son true, el registro aparecerá en tu lista
        return esMismoMes && esMismoAnio;
      }
      return true;
    });
  });

  ngOnInit(): void {
    this.getFichajes();
  }

  getFichajes() {
    const idCliente = this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      console.log('ID desde el padre:', id);
      this.clienteId = id;
    });
    if (!idCliente) {
      console.error('No se pudo encontrar el ID del cliente en la URL');
      return;
    }

    this.fichajeSvc.getRegistros(this.clienteId!).subscribe();
  }

  async guardar() {
    // Uso de coalescencia nula para asegurar que siempre sea un string antes de trim
    const valorActual = (this.nuevoContenido() ?? '').trim();

    if (!valorActual) return;
    //TODO: VER COMO HACER PARA RESPETAR EL FORMATO DEL FICHAJE Y VER EL TEMA DEL TAMAÑO DE LAS IMG
    this.cargando.set(true);
    const nuevo = {
      clienteId: this.clienteId!,
      contenido: this.cleaner.sanitizeInput(this.nuevoContenido()),
    };

    this.fichajeSvc.guardarRegistros(nuevo).subscribe({
      next: () => {
        this.nuevoContenido.set('');
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }
}
export default FichajeTabComponent;
