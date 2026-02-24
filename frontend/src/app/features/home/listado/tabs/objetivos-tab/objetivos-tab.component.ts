import { Component, computed, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClientesService } from '../../../../../services/cliente.service';
import { ObjetivosService } from '../../../../../services/objetivos.service';
import { 
  ObjetivoGeneral, 
  AreaDesarrollo 
} from '../../../../../interface/objetivo-general.interface';

@Component({
  standalone: true,
  selector: 'app-objetivos-tab',
  imports: [CommonModule, FormsModule],
  templateUrl: './objetivos-tab.component.html',
})
export class ObjetivosTabComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private clientesSvc = inject(ClientesService);
  private objetivosSvc = inject(ObjetivosService);

  // Signals del servicio
  objetivosCliente = this.clientesSvc.objetivos;
  estadisticas = this.clientesSvc.estadisticasObjetivos;
  todasLasAreas = this.objetivosSvc.areas;
  todosLosObjetivos = this.objetivosSvc.objetivosGenerales;

  // Estado local
  clienteId = signal<string>('');
  cargando = signal(false);
  modoEdicion = signal(false);
  objetivosSeleccionados = signal<string[]>([]);

  // Computed
  objetivosAgrupados = computed(() => {
    const objetivos = this.objetivosCliente()?.objetivos || [];
    const areas = this.todasLasAreas();

    // Agrupar por área
    return areas.map(area => ({
      area: area.nombre,
      color: area.color,
      objetivos: objetivos.filter(obj => obj.area === area.nombre)
    })).filter(grupo => grupo.objetivos.length > 0);
  });

  objetivosDisponibles = computed(() => {
    const asignados = this.objetivosCliente()?.objetivos || [];
    const asignadosIds = asignados.map(o => o.objetivoGeneralId);
    return this.todosLosObjetivos().filter(
      obj => !asignadosIds.includes(obj.id)
    );
  });

  ngOnInit() {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.clienteId.set(id);
        this.cargarDatos();
      }
    });
  }

  cargarDatos() {
    this.cargando.set(true);

    // Cargar objetivos del cliente
    this.clientesSvc.getObjetivosCliente(this.clienteId()).subscribe({
      next: () => {
        console.log('✅ Objetivos del cliente cargados');
      },
      error: (err) => {
        console.error('❌ Error al cargar objetivos:', err);
        this.cargando.set(false);
      }
    });

    // Cargar estadísticas
    this.clientesSvc.getEstadisticasObjetivos(this.clienteId()).subscribe({
      next: () => {
        console.log('📊 Estadísticas cargadas');
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('❌ Error al cargar estadísticas:', err);
        this.cargando.set(false);
      }
    });

    // Cargar catálogo completo (para modo edición)
    this.objetivosSvc.getAreas().subscribe();
    this.objetivosSvc.getObjetivosGenerales().subscribe();
  }

  activarModoEdicion() {
    this.modoEdicion.set(true);
    // Pre-seleccionar los objetivos actuales
    const objetivosActuales = this.objetivosCliente()?.objetivos || [];
    this.objetivosSeleccionados.set(
      objetivosActuales.map(o => o.id)
    );
  }

  cancelarEdicion() {
    this.modoEdicion.set(false);
    this.objetivosSeleccionados.set([]);
  }

  toggleObjetivo(objetivoId: string) {
    this.objetivosSeleccionados.update(prev => {
      if (prev.includes(objetivoId)) {
        return prev.filter(id => id !== objetivoId);
      } else {
        return [...prev, objetivoId];
      }
    });
  }

  esObjetivoSeleccionado(objetivoId: string): boolean {
    return this.objetivosSeleccionados().includes(objetivoId);
  }

  getObjetivosPorArea(areaId: string) {
    return this.todosLosObjetivos().filter(
      obj => obj.areaDesarrolloId === areaId
    );
  }


  guardarCambios() {
    this.cargando.set(true);

    const objetivosActuales = this.objetivosCliente()?.objetivos.map(o => o.id) || [];
    const objetivosNuevos = this.objetivosSeleccionados();

    // Determinar cuáles agregar y cuáles quitar
    const paraAgregar = objetivosNuevos.filter(id => !objetivosActuales.includes(id));
    const paraQuitar = objetivosActuales.filter(id => !objetivosNuevos.includes(id));

    // Si hay objetivos para agregar
    if (paraAgregar.length > 0) {
      this.clientesSvc.asignarObjetivos(this.clienteId(), {
        objetivosGeneralesIds: paraAgregar
      }).subscribe({
        next: () => {
          console.log('✅ Objetivos agregados');
          this.procesarQuitarObjetivos(paraQuitar);
        },
        error: (err) => {
          console.error('❌ Error al agregar objetivos:', err);
          this.cargando.set(false);
        }
      });
    } else {
      this.procesarQuitarObjetivos(paraQuitar);
    }
  }

  private procesarQuitarObjetivos(paraQuitar: string[]) {
    if (paraQuitar.length === 0) {
      this.finalizarEdicion();
      return;
    }

    // Quitar objetivos uno por uno
    let completados = 0;
    paraQuitar.forEach(objId => {
      this.clientesSvc.desasignarObjetivo(this.clienteId(), objId).subscribe({
        next: () => {
          completados++;
          if (completados === paraQuitar.length) {
            this.finalizarEdicion();
          }
        },
        error: (err) => {
          console.error('❌ Error al quitar objetivo:', err);
          completados++;
          if (completados === paraQuitar.length) {
            this.finalizarEdicion();
          }
        }
      });
    });
  }

  private finalizarEdicion() {
    this.cargarDatos();
    this.modoEdicion.set(false);
    this.objetivosSeleccionados.set([]);
  }
}

export default ObjetivosTabComponent;