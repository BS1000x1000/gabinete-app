import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SesionesService } from '../../../../../services/sesiones.service';
import {
  SesionData,
  EstadoSesion,
  TipoSesion,
} from '../../../../../interface/sesion.interface';

@Component({
  selector: 'app-sesiones-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sesiones-tab.component.html',
})
export class SesionesTabComponent implements OnInit {
  private sesionesService = inject(SesionesService);
  private route = inject(ActivatedRoute);

  // --- Estado ---
  clienteId = signal<string>('');
  sesiones = signal<SesionData[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // --- Filtros ---
  filtroEstado = signal<string>('TODAS');
  filtroMes = signal<string>('');

  // --- Modales ---
  mostrarModalReprogramar = signal(false);
  mostrarModalCancelar = signal(false);
  mostrarModalDetalle = signal(false);
  sesionSeleccionada = signal<SesionData | null>(null);

  // --- Reprogramar form ---
  nuevaFecha = signal<string>('');
  nuevaHoraInicio = signal<string>('');
  nuevaHoraFin = signal<string>('');
  guardandoReprogramacion = signal(false);

  // --- Cancelar form ---
  cancelarConAviso = signal<boolean>(true);
  guardandoCancelacion = signal(false);

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

  // ==========================================
  // MODAL DETALLE
  // ==========================================
  abrirDetalle(sesion: SesionData): void {
    this.sesionSeleccionada.set(sesion);
    this.mostrarModalDetalle.set(true);
  }

  cerrarDetalle(): void {
    this.mostrarModalDetalle.set(false);
    this.sesionSeleccionada.set(null);
  }

  // ==========================================
  // MODAL REPROGRAMAR
  // ==========================================
  abrirReprogramar(sesion: SesionData, event: Event): void {
    event.stopPropagation();
    this.sesionSeleccionada.set(sesion);

    const inicio = new Date(sesion.fechaHoraInicio);
    const fin = new Date(sesion.fechaHoraFin);

    // Precargar valores actuales
    this.nuevaFecha.set(inicio.toISOString().split('T')[0]);
    this.nuevaHoraInicio.set(
      `${String(inicio.getHours()).padStart(2, '0')}:${String(inicio.getMinutes()).padStart(2, '0')}`,
    );
    this.nuevaHoraFin.set(
      `${String(fin.getHours()).padStart(2, '0')}:${String(fin.getMinutes()).padStart(2, '0')}`,
    );

    this.mostrarModalReprogramar.set(true);
  }

  abrirReprogramarDesdeDetalle(): void {
    const sesion = this.sesionSeleccionada();
    if (!sesion) return;

    const inicio = new Date(sesion.fechaHoraInicio);
    const fin = new Date(sesion.fechaHoraFin);

    this.nuevaFecha.set(inicio.toISOString().split('T')[0]);
    this.nuevaHoraInicio.set(
      `${String(inicio.getHours()).padStart(2, '0')}:${String(inicio.getMinutes()).padStart(2, '0')}`,
    );
    this.nuevaHoraFin.set(
      `${String(fin.getHours()).padStart(2, '0')}:${String(fin.getMinutes()).padStart(2, '0')}`,
    );

    this.mostrarModalDetalle.set(false); // cierra detalle DESPUÉS de leer la sesión
    this.mostrarModalReprogramar.set(true);
  }

  cerrarReprogramar(): void {
    this.mostrarModalReprogramar.set(false);
    this.sesionSeleccionada.set(null);
    this.nuevaFecha.set('');
    this.nuevaHoraInicio.set('');
    this.nuevaHoraFin.set('');
  }

  confirmarReprogramacion(): void {
    const sesion = this.sesionSeleccionada();
    if (
      !sesion ||
      !this.nuevaFecha() ||
      !this.nuevaHoraInicio() ||
      !this.nuevaHoraFin()
    )
      return;

    const fechaInicio = new Date(
      `${this.nuevaFecha()}T${this.nuevaHoraInicio()}:00`,
    );
    const fechaFin = new Date(`${this.nuevaFecha()}T${this.nuevaHoraFin()}:00`);

    if (fechaFin <= fechaInicio) {
      alert('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    this.guardandoReprogramacion.set(true);

    this.sesionesService
      .updateSesion(sesion.id, {
        fechaHoraInicio: fechaInicio.toISOString(),
        fechaHoraFin: fechaFin.toISOString(),
      })
      .subscribe({
        next: (actualizada) => {
          this.sesiones.update((prev) =>
            prev.map((s) => (s.id === actualizada.id ? actualizada : s)),
          );
          this.guardandoReprogramacion.set(false);
          this.cerrarReprogramar();
        },
        error: (err) => {
          console.error('❌ Error al reprogramar sesión:', err);
          this.guardandoReprogramacion.set(false);
          alert('No se pudo reprogramar la sesión. Inténtalo de nuevo.');
        },
      });
  }

  // ==========================================
  // MODAL CANCELAR
  // ==========================================
  abrirCancelar(sesion: SesionData, event: Event): void {
    event.stopPropagation();
    this.sesionSeleccionada.set(sesion);
    this.cancelarConAviso.set(true);
    this.mostrarModalCancelar.set(true);
  }

  abrirCancelarDesdeDetalle(): void {
    const sesion = this.sesionSeleccionada();
    if (!sesion) return;
    this.cancelarConAviso.set(true);
    this.mostrarModalDetalle.set(false);
    this.mostrarModalCancelar.set(true);
    // sesionSeleccionada() se mantiene con el valor porque no llamamos a cerrarDetalle()
  }

  cerrarCancelar(): void {
    this.mostrarModalCancelar.set(false);
    this.sesionSeleccionada.set(null);
  }

  confirmarCancelacion(): void {
    const sesion = this.sesionSeleccionada();
    if (!sesion) return;

    this.guardandoCancelacion.set(true);

    this.sesionesService
      .cancelarSesion(sesion.id, this.cancelarConAviso())
      .subscribe({
        next: (actualizada) => {
          this.sesiones.update((prev) =>
            prev.map((s) => (s.id === actualizada.id ? actualizada : s)),
          );
          this.guardandoCancelacion.set(false);
          this.cerrarCancelar();
        },
        error: (err) => {
          console.error('❌ Error al cancelar sesión:', err);
          this.guardandoCancelacion.set(false);
          alert('No se pudo cancelar la sesión. Inténtalo de nuevo.');
        },
      });
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
    const map: Record<TipoSesion, string> = {
      [TipoSesion.PEDAGOGIA]: 'Pedagogía',
      [TipoSesion.NEUROPSICOLOGIA]: 'Neuropsicología',
      [TipoSesion.EVALUACION]: 'Evaluación',
      [TipoSesion.REUNION_COLEGIO]: 'Reunión Colegio',
    };
    return map[tipo] || tipo;
  }

  getTipoBadgeClase(tipo: TipoSesion): string {
    const map: Record<TipoSesion, string> = {
      [TipoSesion.PEDAGOGIA]: 'tipo-pedagogia',
      [TipoSesion.NEUROPSICOLOGIA]: 'tipo-neuro',
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
