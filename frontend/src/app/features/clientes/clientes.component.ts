import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientesService } from '../../services/cliente.service';
import { AuthService } from '../../services/auth.service';
import { ClienteDataBackend } from '../../interface/cliente-backend.interface';
import NuevoClienteWizardComponent from '../../components/nuevo-cliente-wizard/nuevo-cliente-wizard.component';

interface ClienteExtendido extends ClienteDataBackend {
  edad?: number;
  horarioResumen?: string;
  proximaSesion?: string;
  totalSesiones?: number;
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, NuevoClienteWizardComponent],
  templateUrl: './clientes.component.html',
})
export class ClientesComponent implements OnInit {
  private clientesSvc = inject(ClientesService);
  private authSvc = inject(AuthService);
  private router = inject(Router);
  mostrarWizard = signal(false);

  // Estado
  clientes = signal<ClienteExtendido[]>([]);
  isLoading = signal(false);
  
  // Filtros
  busqueda = signal('');
  filtroEstado = signal<'todos' | 'activos' | 'pausados'>('activos');
  filtroCurso = signal('todos');

  // Computed
  clientesFiltrados = computed(() => {
    let resultado = this.clientes();

    // Filtro de búsqueda
    const query = this.busqueda().toLowerCase();
    if (query) {
      resultado = resultado.filter(c => 
        c.nombre.toLowerCase().includes(query) ||
        c.apellidos.toLowerCase().includes(query) ||
        c.dni?.toLowerCase().includes(query)
      );
    }

    // Filtro de estado
    const estado = this.filtroEstado();
    if (estado !== 'todos') {
      resultado = resultado.filter(c => {
        // Asumiendo que tienes un campo "activo" en el backend
        // Si no, puedes usar otra lógica
        return estado === 'activos'; // Ajustar según tu modelo
      });
    }

    // Filtro de curso
    const curso = this.filtroCurso();
    if (curso !== 'todos') {
      resultado = resultado.filter(c => c.curso === curso);
    }

    return resultado;
  });

  cursosDisponibles = computed(() => {
    const cursos = new Set(this.clientes().map(c => c.curso).filter(Boolean));
    return Array.from(cursos).sort();
  });

  estadisticas = computed(() => {
    const total = this.clientes().length;
    const activos = this.clientes().filter(c => true).length; // Ajustar
    const pausados = total - activos;

    return { total, activos, pausados };
  });

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.isLoading.set(true);

    this.clientesSvc.getAll().subscribe({
      next: (data) => {
        console.log(data);
        // Enriquecer datos
        const clientesEnriquecidos = data.map(cliente => ({
          ...cliente,
          edad: this.calcularEdad(cliente.fechaNacimiento),
          horarioResumen: this.generarResumenHorario(cliente.disponibilidad!),
          // proximaSesion y totalSesiones requieren queries adicionales
        }));

        this.clientes.set(clientesEnriquecidos);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Error al cargar clientes:', err);
        this.isLoading.set(false);
      }
    });
  }

  verFicha(clienteId: string) {
    this.router.navigate(['/home/listado', clienteId, 'cliente']);
  }

  editarCliente(clienteId: string) {
    // TODO: Implementar modal de edición
    console.log('Editar cliente:', clienteId);
  }

  nuevoCliente() {
    this.mostrarWizard.set(true);
  }

  cerrarWizard() {
    this.mostrarWizard.set(false);
  }

  exportarCSV() {
    // TODO: Implementar exportación
    console.log('Exportar CSV');
  }

  onClienteCreado(cliente: any) {
    console.log('✅ Cliente creado en el wizard:', cliente);
    this.mostrarWizard.set(false);
    this.cargarClientes(); // Recargar lista
    
    // Opcional: navegar a la ficha del nuevo cliente
    this.router.navigate(['/home/listado', cliente.id, 'cliente']);
  }

  // Helpers
  private calcularEdad(fechaNacimiento: string | Date): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }

  private generarResumenHorario(disponibilidad: any[]): string {
    if (!disponibilidad || disponibilidad.length === 0) {
      return 'Sin definir';
    }

    const lineas = disponibilidad.map(d => {
      const dia = this.getDiaAbrev(d.diaSemana);
      return `${dia} - ${d.horaInicio} - ${d.horaFin}`;
    });

    return lineas.join('\n');
  }

  private getDiaNombre(dia: number): string {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return dias[dia] || '';
  }

  private getDiaAbrev(dia: number): string {
    const dias = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    return dias[dia] || '';
  }
}

export default ClientesComponent;