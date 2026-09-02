import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TrabajadorService, ClienteAsignado } from '../../../../../services/trabajadores.service';
import { ClientesService } from '../../../../../services/cliente.service';
import { ClienteDataBackend } from '../../../../../interface/cliente-backend.interface';
import { TIPO_SESION_LABELS, TipoSesion } from '../../../../../interface/sesion.interface';

/**
 * Convención 0=Domingo..6=Sábado, la de `DisponibilidadClienteTrabajador` y su
 * DTO. NO es la ISO 1=Lun..7=Dom de contratos, horarios y "Mi semana": son dos
 * convenciones distintas conviviendo en el repo, así que este array solo vale
 * para los horarios de asignación.
 *
 * Antes esto era un `Record<string, string>` con claves `LUNES`, `MARTES`… y el
 * backend devuelve las filas crudas, donde `diaSemana` es un `Int`. El lookup
 * no acertaba nunca y caía al fallback: se pintaba `1 17:00` en vez de
 * `Lun 17:00`.
 */
const DIA_CORTO = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

@Component({
  selector: 'app-trabajador-clientes-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trabajador-clientes-tab.component.html',
})
export class TrabajadorClientesTabComponent implements OnInit {
  private readonly route         = inject(ActivatedRoute);
  private readonly trabajadorSvc = inject(TrabajadorService);
  private readonly clientesSvc   = inject(ClientesService);
  private readonly router        = inject(Router);

  private trabajadorId = '';

  readonly clientes   = signal<ClienteAsignado[]>([]);
  readonly isLoading  = signal(true);
  readonly error      = signal<string | null>(null);

  readonly clientesActivos   = computed(() => this.clientes().filter((c) => c.activo));
  readonly clientesInactivos = computed(() => this.clientes().filter((c) => !c.activo));

  // ── Modal state ─────────────────────────────
  readonly modalAbierto     = signal(false);
  readonly todosClientes    = signal<ClienteDataBackend[]>([]);
  readonly busqueda         = signal('');
  readonly tipoTerapia      = signal<TipoSesion | ''>('');
  readonly clienteSelecId   = signal<string>('');
  readonly asignando        = signal(false);
  readonly modalError       = signal<string | null>(null);

  readonly tiposTerapia = Object.entries(TIPO_SESION_LABELS).map(([value, label]) => ({ value, label }));

  readonly clientesFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const asignados = new Set(this.clientes().map((c) => c.id));
    return this.todosClientes()
      .filter((c) => !asignados.has(c.id))
      .filter((c) =>
        !q ||
        c.nombre.toLowerCase().includes(q) ||
        c.apellidos.toLowerCase().includes(q),
      );
  });

  ngOnInit(): void {
    this.trabajadorId = this.route.parent?.snapshot.paramMap.get('id') ?? '';
    this.cargarClientes();
  }

  private cargarClientes(): void {
    this.isLoading.set(true);
    this.trabajadorSvc.getClientesAsignados(this.trabajadorId).subscribe({
      next: (res: any) => {
        this.clientes.set(res.data ?? res ?? []);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'Error al cargar los clientes.');
        this.isLoading.set(false);
      },
    });
  }

  verFichaCliente(clienteId: string): void {
    this.router.navigate(['/home/listado', clienteId, 'perfil']);
  }

  getInitials(c: ClienteAsignado): string {
    return `${c.nombre?.charAt(0) ?? ''}${c.apellidos?.charAt(0) ?? ''}`.toUpperCase();
  }

  /**
   * Estos horarios salen de `DisponibilidadClienteTrabajador`, que desde
   * 2026-08-31 ya NO manda sobre las sesiones: el horario recurrente lo define
   * el contrato. Pueden estar vacíos o desfasados. La foto fiable de la semana
   * está en la pestaña "Mi semana", que lee de `ContratoSlot`.
   */
  formatHorarios(c: ClienteAsignado): string {
    if (!c.horarios?.length) return '';
    return c.horarios
      .map((h) => `${DIA_CORTO[h.diaSemana] ?? h.diaSemana} ${h.horaInicio.slice(0, 5)}`)
      .join(' · ');
  }

  getTerapiaBadgeClass(tipo: string): string {
    const map: Record<string, string> = {
      LOGOPEDIA:            'badge-logopeda',
      NEUROPSICOLOGIA:      'badge-neuro',
      TERAPIA_OCUPACIONAL:  'badge-to',
      PSICOPEDAGOGIA:       'badge-pedagogo',
      PEDAGOGIA:            'badge-pedagogo',
      PSICOLOGIA:           'badge-psico',
    };
    return map[tipo?.toUpperCase()] ?? 'badge-default';
  }

  formatTerapia(tipo: string): string {
    return TIPO_SESION_LABELS[tipo as TipoSesion] ?? tipo;
  }

  // ── Modal actions ────────────────────────────
  abrirModal(): void {
    this.busqueda.set('');
    this.tipoTerapia.set('');
    this.clienteSelecId.set('');
    this.modalError.set(null);

    if (this.todosClientes().length === 0) {
      this.clientesSvc.getAll().subscribe({
        next: (list) => this.todosClientes.set(list),
        error: () => this.todosClientes.set([]),
      });
    }

    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.asignando.set(false);
    this.modalError.set(null);
  }

  seleccionarCliente(id: string): void {
    this.clienteSelecId.set(id);
    this.modalError.set(null);
  }

  confirmarAsignacion(): void {
    if (!this.clienteSelecId()) {
      this.modalError.set('Selecciona un cliente.');
      return;
    }
    if (!this.tipoTerapia()) {
      this.modalError.set('Selecciona el tipo de terapia.');
      return;
    }

    this.asignando.set(true);
    this.modalError.set(null);

    this.trabajadorSvc
      .asignarCliente(this.trabajadorId, this.clienteSelecId(), this.tipoTerapia() as TipoSesion)
      .subscribe({
        next: () => {
          this.todosClientes.set([]); // invalidate cache so next modal open re-fetches
          this.cerrarModal();
          this.cargarClientes();
        },
        error: (err: any) => {
          this.modalError.set(err?.error?.message ?? 'Error al asignar el cliente.');
          this.asignando.set(false);
        },
      });
  }
}

export default TrabajadorClientesTabComponent;
