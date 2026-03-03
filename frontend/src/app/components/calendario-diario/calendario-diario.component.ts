import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SesionesService } from '../../services/sesiones.service';
import { CalendarioDiario, SesionCalendario } from '../../interface/calendario.interface';
import { TIPO_SESION_LABELS, ESTADO_SESION_LABELS } from '../../interface/sesion.interface';

@Component({
  selector: 'app-calendario-diario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario-diario.component.html',
})
export class CalendarioDiarioComponent implements OnInit {
  private sesionesSvc = inject(SesionesService);
  private router = inject(Router);

  // Estado
  calendario = signal<CalendarioDiario | null>(null);
  isLoading = signal(false);
  fechaSeleccionada = signal<Date>(new Date());

  // Computed
  esHoy = computed(() => this.calendario()?.esHoy || false);

  ngOnInit() {
    this.cargarCalendario();
  }

  cargarCalendario(fecha?: string) {
    this.isLoading.set(true);
    
    console.log('📅 Cargando calendario para fecha:', fecha || 'hoy');
    
    this.sesionesSvc.getCalendarioDiario(fecha).subscribe({
      next: (cal) => {
        console.log('✅ Calendario recibido:', cal);
        this.calendario.set(cal);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Error al cargar calendario:', err);
        this.isLoading.set(false);
      }
    });
  }

  diaAnterior() {
    const fecha = this.fechaSeleccionada();
    fecha.setDate(fecha.getDate() - 1);
    this.fechaSeleccionada.set(new Date(fecha));
    this.cargarCalendario(this.formatearFecha(fecha));
  }

  diaSiguiente() {
    const fecha = this.fechaSeleccionada();
    fecha.setDate(fecha.getDate() + 1);
    this.fechaSeleccionada.set(new Date(fecha));
    this.cargarCalendario(this.formatearFecha(fecha));
  }

  irAHoy() {
    const hoy = new Date();
    this.fechaSeleccionada.set(hoy);
    this.cargarCalendario();
  }

  verDetalleSesion(sesion: SesionCalendario) {
    this.router.navigate(['/home/listado', sesion.cliente.id, 'cliente']);
  }

  completarSesion(id: string, event: Event) {
    event.stopPropagation();
    this.sesionesSvc.completarSesion(id, { notas: 'Completada' }).subscribe({
      next: () => {
        console.log('✅ Sesión completada');
        this.cargarCalendario(this.formatearFecha(this.fechaSeleccionada()));
      }
    });
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  getEstadoLabel(estado: string): string {
    return ESTADO_SESION_LABELS[estado as keyof typeof ESTADO_SESION_LABELS] ?? estado;
  }

  getTipoLabel(tipo: string): string {
    return TIPO_SESION_LABELS[tipo as keyof typeof TIPO_SESION_LABELS] ?? tipo;
  }

  getEstadoClass(estado: string): string {
    const clases: Record<string, string> = {
      'PROGRAMADA': 'bg-primary',
      'COMPLETADA': 'bg-success',
      'CANCELADA_CON_AVISO': 'bg-warning',
      'CANCELADA_SIN_AVISO': 'bg-danger',
      'VACACIONES': 'bg-info'
    };
    return clases[estado] || 'bg-secondary';
  }

  getTipoClass(tipo: string): string {
    const clases: Record<string, string> = {
      'PEDAGOGIA': 'border-primary',
      'NEUROPSICOLOGIA': 'border-info',
      'LOGOPEDIA': 'border-success',
      'TERAPIA_OCUPACIONAL': 'border-danger',
      'EVALUACION': 'border-warning',
      'REUNION_COLEGIO': 'border-secondary'
    };
    return clases[tipo] || 'border-dark';
  }

  getEstadoTemporal(sesion: SesionCalendario): string {
    if (!sesion.temporal) return '';
    if (sesion.temporal.esActual) return 'sesion-actual';
    if (sesion.temporal.esPasada) return 'sesion-pasada';
    return 'sesion-futura';
  }
}