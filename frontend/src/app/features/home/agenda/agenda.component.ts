import {
  Component,
  computed,
  inject,
  signal,
  type OnInit,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { SesionData, EstadoSesion, TipoSesion, TIPO_SESION_LABELS, ESTADO_SESION_LABELS } from '../../../interface/sesion.interface';
import { SesionesService } from '../../../services/sesiones.service';
import { SesionAccionesService } from '../../../services/sesiones-acciones.service';
import { CalendarioFullComponent } from '../../../components/calendario-full/calendario-full.component';
import { SesionModalesComponent } from '../../../components/sesiones-modales/sesiones-modales.component';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, CalendarioFullComponent, SesionModalesComponent],
  templateUrl: './agenda.component.html',
})
export class AgendaComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  private sesionesSvc = inject(SesionesService);
  private accionesSvc = inject(SesionAccionesService);
  private destroyRef = inject(DestroyRef);

  readonly TIPO_SESION_LABELS = TIPO_SESION_LABELS;
  readonly ESTADO_SESION_LABELS = ESTADO_SESION_LABELS;

  // Estado
  sesiones = signal<any[]>([]);
  isLoading = signal(false);
  modoFijo = signal<'agenda' | 'calendario'>('agenda');
  selectedRowId = signal<string | null>(null);
  fechaSeleccionada = signal<Date>(new Date());

  // Computed
  totalSesiones = computed(() => this.sesiones().length);

  sesionesCompletadas = computed(
    () =>
      this.sesiones().filter((s) => s.estado === EstadoSesion.COMPLETADA)
        .length,
  );

  sesionesProgramadas = computed(
    () =>
      this.sesiones().filter((s) => s.estado === EstadoSesion.PROGRAMADA)
        .length,
  );

  sesionesCanceladas = computed(
    () =>
      this.sesiones().filter(
        (s) =>
          s.estado === EstadoSesion.CANCELADA_CON_AVISO ||
          s.estado === EstadoSesion.CANCELADA_SIN_AVISO,
      ).length,
  );

  fechaFormateada = computed(() => {
    const fecha = this.fechaSeleccionada();
    return this.formatearFechaCompleta(fecha);
  });

  esHoy = computed(() => {
    const hoy = new Date();
    const seleccionada = this.fechaSeleccionada();
    return hoy.toDateString() === seleccionada.toDateString();
  });

  ngOnInit() {
    this.loadSesiones();
  }

  /**
   * ✅ Cargar sesiones usando el endpoint de calendario diario
   */
  loadSesiones() {
    this.isLoading.set(true);
    const fechaISO = this.formatearFechaISO(this.fechaSeleccionada());

    this.sesionesSvc.getCalendarioDiario(fechaISO)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (calendario) => {
        // ✅ Mapeo simple sin preocuparnos por tipos estrictos
        const sesionesFormateadas = calendario.sesiones.map((s) => ({
          id: s.id,
          fechaHoraInicio: this.parseHoraToDate(
            calendario.fecha,
            s.horaInicio,
          ).toISOString(),
          fechaHoraFin: this.parseHoraToDate(
            calendario.fecha,
            s.horaFin,
          ).toISOString(),
          estado: s.estado,
          tipoSesion: s.tipoSesion,
          cliente: s.cliente,
          clienteId: s.cliente.id,
          trabajadorId: this.auth.currentTrabajadorId(),
          notas: s.notas,
        }));

        this.sesiones.set(sesionesFormateadas);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Error:', err);
        this.isLoading.set(false);
      },
    });
  }

  // Helper para convertir hora string a Date
  private parseHoraToDate(fechaISO: string, hora: string): Date {
    const [horas, minutos] = hora.split(':').map(Number);
    const fecha = new Date(fechaISO + 'T00:00:00.000Z');
    fecha.setHours(horas, minutos, 0, 0);
    return fecha;
  }

  // Navegación
  diaAnterior() {
    const fecha = this.fechaSeleccionada();
    fecha.setDate(fecha.getDate() - 1);
    this.fechaSeleccionada.set(new Date(fecha));
    this.loadSesiones();
  }

  diaSiguiente() {
    const fecha = this.fechaSeleccionada();
    fecha.setDate(fecha.getDate() + 1);
    this.fechaSeleccionada.set(new Date(fecha));
    this.loadSesiones();
  }

  irAHoy() {
    this.fechaSeleccionada.set(new Date());
    this.loadSesiones();
  }

  // Acciones
  verDetalle(sesion: SesionData) {
    this.router.navigate(['/home/listado', sesion.clienteId, 'registro']);
  }

  marcarAsistencia(id: string, valor: boolean) {
    this.sesiones.update((lista) =>
      lista.map((s) => (s.id === id ? { ...s, asistio: valor } : s)),
    );
  }

  abrirCompletar(sesion: SesionData, event: Event) {
    this.accionesSvc.abrirCompletar(sesion, event, () => this.loadSesiones());
  }

  onFilaClick(sesion: SesionData) {
    this.selectedRowId.update((id) => (id === sesion.id ? null : sesion.id));
    this.router.navigate(['/home/listado', sesion.clienteId, 'cliente']);
  }

  abrirCancelar(sesion: SesionData, event: Event) {
    this.accionesSvc.abrirCancelar(sesion, event, () => this.loadSesiones());
  }

  refrescar() {
    this.loadSesiones();
  }

  // Helpers
  private formatearFechaCompleta(fecha: Date): string {
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return fecha.toLocaleDateString('es-ES', opciones);
  }

  private formatearFechaISO(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }
}

export default AgendaComponent;
