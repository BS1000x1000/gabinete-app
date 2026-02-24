import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ClientesService } from '../../../../../services/cliente.service';

interface Asignacion {
  id: string;
  trabajador: {
    id: string;
    nombre: string;
    apellidos: string;
    email: string;
  };
  tipoTerapia: string;
  activo: boolean;
  horarios: {
    id: string;
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
  }[];
  createdAt: Date;
}

@Component({
  selector: 'app-trabajador-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trabajador-tab.component.html',
})
export class TrabajadorTabComponent implements OnInit {
  private clientesSvc = inject(ClientesService);
  private route = inject(ActivatedRoute);

  clienteId: string = '';

  // Estado
  asignaciones = signal<Asignacion[]>([]);
  isLoading = signal(false);
  mostrarModalAsignar = signal(false);

  ngOnInit() {
    // ✅ Obtener clienteId de la ruta padre
    this.clienteId = this.route.parent?.snapshot.paramMap.get('id') || '';
    
    console.log('📋 Cliente ID desde ruta:', this.clienteId);
    
    if (this.clienteId) {
      this.cargarAsignaciones();
    }
  }

  /**
   * Cargar asignaciones del cliente
   */
  private cargarAsignaciones() {
    this.isLoading.set(true);

    this.clientesSvc.getById(this.clienteId).subscribe({
      next: (cliente) => {
        // Mapear las asignaciones
        const asignacionesMapeadas = cliente.trabajadoresAsignados?.map((ct: any) => ({
          id: ct.id,
          trabajador: ct.trabajador,
          tipoTerapia: ct.tipoTerapia,
          activo: ct.activo,
          horarios: ct.horarios || [],
          createdAt: new Date(ct.createdAt),
        })) || [];

        this.asignaciones.set(asignacionesMapeadas);
        this.isLoading.set(false);

        console.log('✅ Asignaciones cargadas:', asignacionesMapeadas.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar asignaciones:', err);
        this.isLoading.set(false);
      },
    });
  }

  abrirModalAsignarTrabajador() {
    this.mostrarModalAsignar.set(true);
  }

  cerrarModal() {
    this.mostrarModalAsignar.set(false);
  }

  desasignarTrabajador(asignacionId: string) {
    const confirmacion = confirm(
      '¿Estás seguro de que deseas eliminar esta asignación?\n\n' +
      'Se eliminarán también todos los horarios asociados.'
    );

    if (!confirmacion) return;

    console.log('🗑️ Desasignando:', asignacionId);
    
    // Por ahora, solo remover del array
    this.asignaciones.update(prev => 
      prev.filter(a => a.id !== asignacionId)
    );
  }

  onAsignacionCreada() {
    this.cerrarModal();
    this.cargarAsignaciones();
  }

  getDiaNombre(dia: number): string {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return dias[dia] || '';
  }

  getBadgeClass(tipo: string): string {
    const clases: { [key: string]: string } = {
      'Pedagogía': 'bg-primary',
      'Neuropsicología': 'bg-info',
      'Logopedia': 'bg-success',
      'Psicología': 'bg-warning text-dark',
      'Refuerzo Educativo': 'bg-secondary',
      'Estimulación Temprana': 'bg-danger',
    };
    return clases[tipo] || 'bg-secondary';
  }
}

export default TrabajadorTabComponent;