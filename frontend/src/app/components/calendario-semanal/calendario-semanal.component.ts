import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SesionesService } from '../../services/sesiones.service';
import { AuthService } from '../../services/auth.service';
import { CalendarioSemanal, DiaSemana, SesionCalendario } from '../../interface/calendario.interface';
import { TIPO_SESION_LABELS, ESTADO_SESION_LABELS } from '../../interface/sesion.interface';

@Component({
  selector: 'app-calendario-semanal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario-semanal.component.html',
})
export class CalendarioSemanalComponent implements OnInit {
  private sesionesSvc = inject(SesionesService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // Estado
  calendario = signal<CalendarioSemanal | null>(null);
  isLoading = signal(false);
  fechaSeleccionada = signal<Date>(new Date());

  // Computed
  semanaMostrar = computed(() => {
    const cal = this.calendario();
    if (!cal) return '';
    return `${cal.rangoSemana.inicioFormateado} - ${cal.rangoSemana.finFormateado}`;
  });

  ngOnInit() {
    this.cargarCalendario();
  }

  cargarCalendario(fecha?: string) {
    this.isLoading.set(true);
    
    this.sesionesSvc.getCalendarioSemanal(fecha)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cal) => {
          this.calendario.set(cal);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('❌ Error al cargar calendario:', err);
          this.isLoading.set(false);
        }
      });
  }

  semanaAnterior() {
    const fecha = this.fechaSeleccionada();
    fecha.setDate(fecha.getDate() - 7);
    this.fechaSeleccionada.set(new Date(fecha));
    this.cargarCalendario(this.formatearFecha(fecha));
  }

  semanaSiguiente() {
    const fecha = this.fechaSeleccionada();
    fecha.setDate(fecha.getDate() + 7);
    this.fechaSeleccionada.set(new Date(fecha));
    this.cargarCalendario(this.formatearFecha(fecha));
  }

  hoy() {
    const hoy = new Date();
    this.fechaSeleccionada.set(hoy);
    this.cargarCalendario();
  }

  verDetalleSesion(sesion: SesionCalendario) {
    this.router.navigate(['/home/listado', sesion.cliente.id, 'cliente']);
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
      'CANCELADA_SIN_AVISO': 'bg-danger'
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
}