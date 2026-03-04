import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClientesService } from '../../services/cliente.service';
import { ClienteDataBackend } from '../../interface/cliente-backend.interface';
import NuevoClienteWizardComponent from '../../components/nuevo-cliente-wizard/nuevo-cliente-wizard.component';
import { calcularEdad, calcularEdadTexto } from '../../shared/utils/date';

interface ClienteExtendido extends ClienteDataBackend {
  edad?: number;
  edadTexto: Date | string;
  horarioResumen?: string;
}

interface FormEdicion {
  nombre: string;
  apellidos: string;
  curso: string;
  activo: boolean;
}

const POR_PAGINA = 20;

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, NuevoClienteWizardComponent],
  templateUrl: './clientes.component.html',
})
export class ClientesComponent implements OnInit {
  private clientesSvc = inject(ClientesService);
  private router = inject(Router);

  // UI state
  mostrarWizard = signal(false);
  mostrarModalEdicion = signal(false);
  guardando = signal(false);

  // Datos
  clientes = signal<ClienteExtendido[]>([]);
  isLoading = signal(false);

  // Filtros
  busqueda = signal('');
  filtroEstado = signal<'todos' | 'activos' | 'pausados'>('activos');
  filtroCurso = signal('todos');

  // Paginación
  paginaActual = signal(1);
  readonly porPagina = POR_PAGINA;

  // Edición — solo el id, formEdicion tiene el resto
  clienteEditandoId = signal<string | null>(null);
  formEdicion = signal<FormEdicion>({ nombre: '', apellidos: '', curso: '', activo: true });

  // Computed
  clientesFiltrados = computed(() => {
    const query = this.busqueda().toLowerCase();
    const estado = this.filtroEstado();
    const curso = this.filtroCurso();

    return this.clientes().filter(c => {
      if (query &&
        !c.nombre.toLowerCase().includes(query) &&
        !c.apellidos.toLowerCase().includes(query) &&
        !c.dni?.toLowerCase().includes(query)
      ) return false;

      if (estado === 'activos' && !c.activo) return false;
      if (estado === 'pausados' && c.activo) return false;

      if (curso !== 'todos' && c.curso !== curso) return false;

      return true;
    });
  });

  totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.clientesFiltrados().length / this.porPagina))
  );

  clientesPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.porPagina;
    return this.clientesFiltrados().slice(inicio, inicio + this.porPagina);
  });

  rangoMostrado = computed(() => {
    const total = this.clientesFiltrados().length;
    if (total === 0) return 'Sin resultados';
    const pagFin = this.paginaActual() * this.porPagina;
    const inicio = pagFin - this.porPagina + 1;
    const fin = Math.min(pagFin, total);
    return `Mostrando ${inicio}–${fin} de ${total}`;
  });

  cursosDisponibles = computed(() => {
    const cursos = new Set(this.clientes().map(c => c.curso).filter(Boolean));
    return Array.from(cursos).sort();
  });

  estadisticas = computed(() => {
    const all = this.clientes();
    const activos = all.filter(c => c.activo).length;
    return { total: all.length, activos, pausados: all.length - activos };
  });

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.isLoading.set(true);
    this.clientesSvc.getAll().subscribe({
      next: (data) => {
        this.clientes.set(data.map(cliente => ({
          ...cliente,
          edad: calcularEdad(cliente.fechaNacimiento),
          edadTexto: calcularEdadTexto(cliente.fechaNacimiento).texto,
          horarioResumen: this.generarResumenHorario(cliente.disponibilidad ?? []),
        })));
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

  editarCliente(cliente: ClienteExtendido, event: Event) {
    event.stopPropagation();
    this.clienteEditandoId.set(cliente.id);
    this.formEdicion.set({
      nombre: cliente.nombre,
      apellidos: cliente.apellidos,
      curso: cliente.curso ?? '',
      activo: cliente.activo,
    });
    this.mostrarModalEdicion.set(true);
  }

  updateFormField(field: keyof FormEdicion, value: any) {
    this.formEdicion.update(f => ({ ...f, [field]: value }));
  }

  guardarEdicion() {
    const id = this.clienteEditandoId();
    if (!id) return;

    this.guardando.set(true);
    const { nombre, apellidos, curso, activo } = this.formEdicion();

    this.clientesSvc.updateCliente(id, { nombre, apellidos, curso, activo }).subscribe({
      next: () => {
        this.clientes.update(lista =>
          lista.map(c => c.id === id ? { ...c, nombre, apellidos, curso, activo } : c)
        );
        this.cerrarModal();
        this.guardando.set(false);
      },
      error: (err) => {
        console.error('❌ Error al actualizar cliente:', err);
        this.guardando.set(false);
      }
    });
  }

  cerrarModal() {
    this.mostrarModalEdicion.set(false);
    this.clienteEditandoId.set(null);
  }

  nuevoRegistro(clienteId: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/home/listado', clienteId, 'progreso']);
  }

  nuevoCliente() {
    this.mostrarWizard.set(true);
  }

  cerrarWizard() {
    this.mostrarWizard.set(false);
  }

  onClienteCreado(cliente: any) {
    this.mostrarWizard.set(false);
    this.clientes.update(lista => [{
      ...cliente,
      edad: calcularEdad(cliente.fechaNacimiento),
      edadTexto: calcularEdadTexto(cliente.fechaNacimiento).texto,
      horarioResumen: this.generarResumenHorario(cliente.disponibilidad ?? []),
    }, ...lista]);
    this.router.navigate(['/home/listado', cliente.id, 'cliente']);
  }

  paginaAnterior() {
    if (this.paginaActual() > 1) this.paginaActual.update(p => p - 1);
  }

  paginaSiguiente() {
    if (this.paginaActual() < this.totalPaginas()) this.paginaActual.update(p => p + 1);
  }

  onBusquedaChange(value: string) {
    this.busqueda.set(value);
    this.paginaActual.set(1);
  }

  onFiltroEstadoChange(value: 'todos' | 'activos' | 'pausados') {
    this.filtroEstado.set(value);
    this.paginaActual.set(1);
  }

  onFiltroCursoChange(value: string) {
    this.filtroCurso.set(value);
    this.paginaActual.set(1);
  }

  getTipoTerapia(cliente: ClienteExtendido): string | null {
    return cliente.trabajadoresAsignados?.[0]?.tipoTerapia ?? null;
  }

  private generarResumenHorario(disponibilidad: any[]): string {
    if (!disponibilidad || disponibilidad.length === 0) return 'Sin definir';
    return disponibilidad
      .map(d => `${this.getDiaAbrev(d.diaSemana)} ${d.horaInicio}–${d.horaFin}`)
      .join(' · ');
  }

  private getDiaAbrev(dia: number): string {
    return ['D', 'L', 'M', 'X', 'J', 'V', 'S'][dia] ?? '';
  }
}

export default ClientesComponent;
