import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SesionesService } from '../../../../../services/sesiones.service';
import {
  SesionData,
  EstadoSesion,
  TipoSesion,
  TIPO_SESION_LABELS,
} from '../../../../../interface/sesion.interface';
import { SesionAccionesService } from '../../../../../services/sesiones-acciones.service';
import { SesionModalesComponent } from '../../../../../components/sesiones-modales/sesiones-modales.component';

@Component({
  selector: 'app-sesiones-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, SesionModalesComponent],
  templateUrl: './sesiones-tab.component.html',
})
export class SesionesTabComponent implements OnInit {
  private sesionesService = inject(SesionesService);
  private route = inject(ActivatedRoute);
  private accionesSvc = inject(SesionAccionesService);

  // --- Estado ---
  clienteId = signal<string>('');
  sesiones = signal<SesionData[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // --- Filtros ---
  filtroEstado = signal<string>('TODAS');
  filtroMes = signal<string>('');

  // --- Modales ---
  mostrarModalDetalle = signal(false);
  sesionSeleccionada = signal<SesionData | null>(null);

  // --- Enums expuestos al template ---
  readonly EstadoSesion = EstadoSesion;
  readonly TipoSesion = TipoSesion;

  // --- Opciones de filtro ---
  readonly opcionesEstado = [
    { value: 'TODAS', label: 'Todas' },
    { value: EstadoSesion.PROGRAMADA, label: 'Programadas' },
    { value: EstadoSesion.COMPLETADA, label: 'Completadas' },
    { value: EstadoSesion.CANCELADA_CON_AVISO, label: 'Canceladas con aviso' },
    { value: EstadoSesion.CANCELADA_SIN_AVISO, label: 'Canceladas sin aviso' },
  ];

  // --- Computed: sesiones filtradas ---
  sesionesFiltradas = computed(() => {
    let lista = [...this.sesiones()];
    const estado = this.filtroEstado();
    const mes = this.filtroMes();

    if (estado !== 'TODAS') {
      lista = lista.filter((s) => s.estado === estado);
    }

    if (mes) {
      lista = lista.filter((s) => {
        const fechaSesion = new Date(s.fechaHoraInicio);
        const mesAnio = `${fechaSesion.getFullYear()}-${String(fechaSesion.getMonth() + 1).padStart(2, '0')}`;
        return mesAnio === mes;
      });
    }

    const ahora = new Date();
    const futuras = lista
      .filter((s) => new Date(s.fechaHoraInicio) >= ahora)
      .sort(
        (a, b) =>
          new Date(a.fechaHoraInicio).getTime() -
          new Date(b.fechaHoraInicio).getTime(),
      );
    const pasadas = lista
      .filter((s) => new Date(s.fechaHoraInicio) < ahora)
      .sort(
        (a, b) =>
          new Date(b.fechaHoraInicio).getTime() -
          new Date(a.fechaHoraInicio).getTime(),
      );

    return [...futuras, ...pasadas];
  });

  // --- Computed: estadísticas ---
  stats = computed(() => {
    const todas = this.sesiones();
    return {
      total: todas.length,
      programadas: todas.filter((s) => s.estado === EstadoSesion.PROGRAMADA)
        .length,
      completadas: todas.filter((s) => s.estado === EstadoSesion.COMPLETADA)
        .length,
      canceladas: todas.filter(
        (s) =>
          s.estado === EstadoSesion.CANCELADA_CON_AVISO ||
          s.estado === EstadoSesion.CANCELADA_SIN_AVISO,
      ).length,
      ratioAsistencia:
        todas.length > 0
          ? Math.round(
              (todas.filter((s) => s.estado === EstadoSesion.COMPLETADA)
                .length /
                todas.filter(
                  (s) =>
                    s.estado === EstadoSesion.COMPLETADA ||
                    s.estado === EstadoSesion.CANCELADA_CON_AVISO ||
                    s.estado === EstadoSesion.CANCELADA_SIN_AVISO,
                ).length) *
                100,
            ) || 0
          : 0,
    };
  });

  // --- Computed: meses disponibles para filtro ---
  mesesDisponibles = computed(() => {
    const meses = new Set<string>();
    this.sesiones().forEach((s) => {
      const fecha = new Date(s.fechaHoraInicio);
      const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      meses.add(clave);
    });
    return Array.from(meses)
      .sort()
      .reverse()
      .map((m) => {
        const [anio, mes] = m.split('-');
        const fecha = new Date(parseInt(anio), parseInt(mes) - 1, 1);
        return {
          value: m,
          label: fecha.toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric',
          }),
        };
      });
  });

  ngOnInit(): void {
    this.clienteId.set(this.route.parent?.snapshot.paramMap.get('id') || '');
    if (this.clienteId()) {
      this.cargarSesiones();
    }
  }

  cargarSesiones(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.sesionesService.getSesionesByCliente(this.clienteId()).subscribe({
      next: (data) => {
        this.sesiones.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudieron cargar las sesiones.');
        this.isLoading.set(false);
        console.error('❌ Error al cargar sesiones:', err);
      },
    });
  }

  // Wrappers que inyectan el callback de refresco
  abrirCompletar(sesion: SesionData, event: Event) {
    this.accionesSvc.abrirCompletar(sesion, event, () => this.cargarSesiones());
  }

  abrirCancelar(sesion: SesionData, event: Event) {
    this.accionesSvc.abrirCancelar(sesion, event, () => this.cargarSesiones());
  }

  abrirReprogramar(sesion: SesionData, event: Event) {
    this.accionesSvc.abrirReprogramar(sesion, event, () =>
      this.cargarSesiones(),
    );
  }

  abrirDetalle(sesion: SesionData, event?: Event) {
    this.accionesSvc.abrirDetalle(sesion, event);
  }

  // Para abrir desde el modal de detalle (sin event)
  abrirCompletarDesdeDetalle() {
    const sesion = this.sesionSeleccionada();
    if (!sesion) return;
    this.mostrarModalDetalle.set(false);
    this.accionesSvc.abrirCompletar(sesion, undefined, () =>
      this.cargarSesiones(),
    );
  }

  abrirCancelarDesdeDetalle() {
    const sesion = this.sesionSeleccionada();
    if (!sesion) return;
    this.mostrarModalDetalle.set(false);
    this.accionesSvc.abrirCancelar(sesion, undefined, () =>
      this.cargarSesiones(),
    );
  }

  abrirReprogramarDesdeDetalle() {
    const sesion = this.sesionSeleccionada();
    if (!sesion) return;
    this.mostrarModalDetalle.set(false);
    this.accionesSvc.abrirReprogramar(sesion, undefined, () =>
      this.cargarSesiones(),
    );
  }

  // ==========================================
  // HELPERS UI
  // ==========================================
  getBadgeClase(estado: EstadoSesion): string {
    const map: Record<EstadoSesion, string> = {
      [EstadoSesion.PROGRAMADA]: 'badge-programada',
      [EstadoSesion.COMPLETADA]: 'badge-completada',
      [EstadoSesion.CANCELADA_CON_AVISO]: 'badge-cancelada-aviso',
      [EstadoSesion.CANCELADA_SIN_AVISO]: 'badge-cancelada-sin-aviso',
    };
    return map[estado] || 'bg-secondary';
  }

  getBadgeIcono(estado: EstadoSesion): string {
    const map: Record<EstadoSesion, string> = {
      [EstadoSesion.PROGRAMADA]: 'bi-clock',
      [EstadoSesion.COMPLETADA]: 'bi-check-circle-fill',
      [EstadoSesion.CANCELADA_CON_AVISO]: 'bi-x-circle',
      [EstadoSesion.CANCELADA_SIN_AVISO]: 'bi-x-circle-fill',
    };
    return map[estado] || 'bi-question-circle';
  }

  getEstadoLabel(estado: EstadoSesion): string {
    const map: Record<EstadoSesion, string> = {
      [EstadoSesion.PROGRAMADA]: 'Programada',
      [EstadoSesion.COMPLETADA]: 'Completada',
      [EstadoSesion.CANCELADA_CON_AVISO]: 'Cancelada con aviso',
      [EstadoSesion.CANCELADA_SIN_AVISO]: 'Cancelada sin aviso',
    };
    return map[estado] || estado;
  }

  getTipoLabel(tipo: TipoSesion): string {
    return TIPO_SESION_LABELS[tipo] ?? tipo;
  }

  getTipoBadgeClase(tipo: TipoSesion): string {
    const map: Record<TipoSesion, string> = {
      [TipoSesion.PEDAGOGIA]: 'tipo-pedagogia',
      [TipoSesion.NEUROPSICOLOGIA]: 'tipo-neuro',
      [TipoSesion.LOGOPEDIA]: 'tipo-logopedia',
      [TipoSesion.TERAPIA_OCUPACIONAL]: 'tipo-to',
      [TipoSesion.EVALUACION]: 'tipo-evaluacion',
      [TipoSesion.REUNION_COLEGIO]: 'tipo-reunion',
    };
    return map[tipo] || 'bg-secondary';
  }

  formatearFecha(iso: string): string {
    return new Date(iso).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatearHora(iso: string): string {
    return new Date(iso).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getDuracion(inicio: string, fin: string): number {
    return Math.round(
      (new Date(fin).getTime() - new Date(inicio).getTime()) / 60000,
    );
  }

  esCancelable(estado: EstadoSesion): boolean {
    return estado === EstadoSesion.PROGRAMADA;
  }

  esReprogramable(estado: EstadoSesion): boolean {
    return estado === EstadoSesion.PROGRAMADA;
  }

  limpiarFiltros(): void {
    this.filtroEstado.set('TODAS');
    this.filtroMes.set('');
  }
}

export default SesionesTabComponent;
