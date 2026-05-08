import { Injectable, inject, signal } from '@angular/core';
import { SesionesService } from './sesiones.service';
import { SesionData, ModalidadSesion } from '../interface/sesion.interface';

@Injectable({ providedIn: 'root' })
export class SesionAccionesService {
  private sesionesSvc = inject(SesionesService);

  // ── Modal completar ──
  sesionACompletar = signal<SesionData | null>(null);
  guardandoCompletar = signal(false);

  // ── Modal cancelar ──
  sesionACancelar = signal<SesionData | null>(null);
  guardandoCancelacion = signal(false);
  cancelarConAviso = signal<boolean>(true);

  // ── Modal reprogramar ──
  sesionAReprogramar = signal<SesionData | null>(null);
  guardandoReprogramacion = signal(false);
  nuevaFecha = signal<string>('');
  nuevaHoraInicio = signal<string>('');
  nuevaHoraFin = signal<string>('');

    // ── Modal detalle ──
  sesionDetalle = signal<SesionData | null>(null);
  guardandoModalidad = signal(false);

  // Callbacks de refresco
  private onCompletadaCallback?: () => void;
  private onCanceladaCallback?: () => void;
  private onReprogramadaCallback?: () => void;
  private onDetalleChangedCallback?: () => void;

  // ══════════════════════════════════════════
  // COMPLETAR
  // ══════════════════════════════════════════
  abrirCompletar(sesion: SesionData, event?: Event, onCompletada?: () => void) {
    event?.stopPropagation();
    this.sesionACompletar.set(sesion);
    this.onCompletadaCallback = onCompletada;
  }

  cerrarCompletar() {
    this.sesionACompletar.set(null);
  }

  confirmarCompletar() {
    const sesion = this.sesionACompletar();
    if (!sesion) return;

    this.guardandoCompletar.set(true);
    this.sesionesSvc.completarSesion(sesion.id, {}).subscribe({
      next: () => {
        this.sesionACompletar.set(null);
        this.guardandoCompletar.set(false);
        this.onCompletadaCallback?.();
      },
      error: (err) => {
        console.error('❌ Error al completar:', err);
        this.guardandoCompletar.set(false);
      },
    });
  }

  // ══════════════════════════════════════════
  // CANCELAR
  // ══════════════════════════════════════════
  abrirCancelar(sesion: SesionData, event?: Event, onCancelada?: () => void) {
    event?.stopPropagation();
    this.sesionACancelar.set(sesion);
    this.cancelarConAviso.set(true);
    this.onCanceladaCallback = onCancelada;
  }

  cerrarCancelar() {
    this.sesionACancelar.set(null);
  }

  confirmarCancelacion() {
    const sesion = this.sesionACancelar();
    if (!sesion) return;

    this.guardandoCancelacion.set(true);
    this.sesionesSvc.cancelarSesion(sesion.id, this.cancelarConAviso()).subscribe({
      next: () => {
        this.sesionACancelar.set(null);
        this.guardandoCancelacion.set(false);
        this.onCanceladaCallback?.();
      },
      error: (err) => {
        console.error('❌ Error al cancelar:', err);
        this.guardandoCancelacion.set(false);
      },
    });
  }

  // ══════════════════════════════════════════
  // REPROGRAMAR
  // ══════════════════════════════════════════
  abrirReprogramar(sesion: SesionData, event?: Event, onReprogramada?: () => void) {
    event?.stopPropagation();
    this.sesionAReprogramar.set(sesion);
    this.onReprogramadaCallback = onReprogramada;

    // Precargar fechas actuales de la sesión
    const inicio = new Date(sesion.fechaHoraInicio);
    const fin = new Date(sesion.fechaHoraFin);
    this.nuevaFecha.set(inicio.toISOString().split('T')[0]);
    this.nuevaHoraInicio.set(
      `${String(inicio.getHours()).padStart(2, '0')}:${String(inicio.getMinutes()).padStart(2, '0')}`
    );
    this.nuevaHoraFin.set(
      `${String(fin.getHours()).padStart(2, '0')}:${String(fin.getMinutes()).padStart(2, '0')}`
    );
  }

  cerrarReprogramar() {
    this.sesionAReprogramar.set(null);
    this.nuevaFecha.set('');
    this.nuevaHoraInicio.set('');
    this.nuevaHoraFin.set('');
  }

  confirmarReprogramacion() {
    const sesion = this.sesionAReprogramar();
    if (!sesion || !this.nuevaFecha() || !this.nuevaHoraInicio() || !this.nuevaHoraFin()) return;

    const fechaInicio = new Date(`${this.nuevaFecha()}T${this.nuevaHoraInicio()}:00`);
    const fechaFin = new Date(`${this.nuevaFecha()}T${this.nuevaHoraFin()}:00`);

    if (fechaFin <= fechaInicio) {
      alert('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    this.guardandoReprogramacion.set(true);
    this.sesionesSvc.updateSesion(sesion.id, {
      fechaHoraInicio: fechaInicio.toISOString(),
      fechaHoraFin: fechaFin.toISOString(),
    }).subscribe({
      next: () => {
        this.sesionAReprogramar.set(null);
        this.guardandoReprogramacion.set(false);
        this.cerrarReprogramar();
        this.onReprogramadaCallback?.();
      },
      error: (err) => {
        console.error('❌ Error al reprogramar:', err);
        this.guardandoReprogramacion.set(false);
      },
    });
  }

  abrirDetalle(sesion: SesionData, event?: Event, onChanged?: () => void) {
    event?.stopPropagation();
    this.sesionDetalle.set(sesion);
    this.onDetalleChangedCallback = onChanged;
  }

  cambiarModalidad(modalidad: ModalidadSesion) {
    const sesion = this.sesionDetalle();
    if (!sesion || sesion.modalidad === modalidad) return;
    this.guardandoModalidad.set(true);
    this.sesionesSvc.updateSesion(sesion.id, { modalidad }).subscribe({
      next: () => {
        this.sesionDetalle.set({ ...sesion, modalidad });
        this.guardandoModalidad.set(false);
        this.onDetalleChangedCallback?.();
      },
      error: () => this.guardandoModalidad.set(false),
    });
  }

  toggleModalidadSesion(sesion: SesionData, event: Event, onToggled?: () => void) {
    event.stopPropagation();
    if (this.guardandoModalidad()) return;
    const nuevaModalidad: ModalidadSesion = sesion.modalidad === 'ONLINE' ? 'PRESENCIAL' : 'ONLINE';
    this.guardandoModalidad.set(true);
    this.sesionesSvc.updateSesion(sesion.id, { modalidad: nuevaModalidad }).subscribe({
      next: () => { this.guardandoModalidad.set(false); onToggled?.(); },
      error: (err) => { console.error('❌ Error cambiando modalidad:', err); this.guardandoModalidad.set(false); },
    });
  }

cerrarDetalle() {
  this.sesionDetalle.set(null);
}

// Transiciones detalle → otro modal
completarDesdeDetalle(onCompletada?: () => void) {
  const sesion = this.sesionDetalle();
  if (!sesion) return;
  this.cerrarDetalle();
  this.abrirCompletar(sesion, undefined, onCompletada);
}

cancelarDesdeDetalle(onCancelada?: () => void) {
  const sesion = this.sesionDetalle();
  if (!sesion) return;
  this.cerrarDetalle();
  this.abrirCancelar(sesion, undefined, onCancelada);
}

reprogramarDesdeDetalle(onReprogramada?: () => void) {
  const sesion = this.sesionDetalle();
  if (!sesion) return;
  this.cerrarDetalle();
  this.abrirReprogramar(sesion, undefined, onReprogramada);
}

  // ── Helper compartido para calcular duración en el template ──
  getDuracion(inicio: string, fin: string): number {
    return Math.round(
      (new Date(fin).getTime() - new Date(inicio).getTime()) / 60000
    );
  }
}