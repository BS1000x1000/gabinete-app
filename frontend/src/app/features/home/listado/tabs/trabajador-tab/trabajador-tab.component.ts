import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormArray,
  Validators,
} from '@angular/forms';
import { ConfirmModalComponent } from '../../../../../shared/components/confirm-modal/confirm-modal.component';
import { ActivatedRoute } from '@angular/router';
import { ClientesService } from '../../../../../services/cliente.service';
import { TrabajadorService } from '../../../../../services/trabajadores.service';
import { TipoSesion, TIPO_SESION_LABELS } from '../../../../../interface/sesion.interface';

interface Horario {
  id: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}

interface Asignacion {
  id: string;
  trabajador: { id: string; nombre: string; apellidos: string; email: string };
  tipoTerapia: TipoSesion;
  activo: boolean;
  horarios: Horario[];
  createdAt: Date;
}

@Component({
  selector: 'app-trabajador-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmModalComponent],
  templateUrl: './trabajador-tab.component.html',
})
export class TrabajadorTabComponent implements OnInit {
  private clientesSvc = inject(ClientesService);
  private trabajadorSvc = inject(TrabajadorService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  clienteId = '';
  asignaciones = signal<Asignacion[]>([]);
  isLoading = signal(false);

  // ─── CONSTANTES ───────────────────────────────────────────
  readonly DIAS_SEMANA = [
    { valor: 1, nombre: 'Lunes' },
    { valor: 2, nombre: 'Martes' },
    { valor: 3, nombre: 'Miércoles' },
    { valor: 4, nombre: 'Jueves' },
    { valor: 5, nombre: 'Viernes' },
    { valor: 6, nombre: 'Sábado' },
    { valor: 0, nombre: 'Domingo' },
  ];
  readonly DIAS_CORTO = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  readonly TIPO_SESION_LABELS = TIPO_SESION_LABELS;
  readonly TIPOS_SESION = [
    { value: 'PEDAGOGIA', label: 'Pedagogía' },
    { value: 'NEUROPSICOLOGIA', label: 'Neuropsicología' },
    { value: 'LOGOPEDIA', label: 'Logopedia' },
    { value: 'TERAPIA_OCUPACIONAL', label: 'Terapia Ocupacional' },
    { value: 'EVALUACION', label: 'Evaluación' },
    { value: 'REUNION_COLEGIO', label: 'Reunión Colegio' },
  ];

  // ─── MODAL: AÑADIR TERAPEUTA ───────────────────────────────
  mostrarModalAniadir = signal(false);
  guardandoAsignacion = signal(false);
  errorAsignacion = signal<string | null>(null);
  trabajadoresDisponibles = this.trabajadorSvc.trabajadores;

  formAniadir = this.fb.group({
    trabajadorId: ['', Validators.required],
    tipoTerapia: ['', Validators.required],
    horarios: this.fb.array([]),
  });

  get horariosAniadir(): FormArray {
    return this.formAniadir.get('horarios') as FormArray;
  }

  // ─── MODAL: EDITAR HORARIOS ────────────────────────────────
  mostrarModalHorarios = signal(false);
  asignacionEditando = signal<Asignacion | null>(null);
  guardandoHorarios = signal(false);
  errorHorarios = signal<string | null>(null);

  formHorarios = this.fb.group({
    horarios: this.fb.array([]),
  });

  get horariosEditar(): FormArray {
    return this.formHorarios.get('horarios') as FormArray;
  }

  asignacionSeleccionada = signal<Asignacion | null>(null);

  pendingAction = signal<(() => void) | null>(null);
  confirmMsg    = signal('');

  // ─── LIFECYCLE ─────────────────────────────────────────────
  ngOnInit() {
    this.clienteId = this.route.parent?.snapshot.paramMap.get('id') || '';
    if (this.clienteId) this.cargarAsignaciones();
  }

  private crearHorarioGroup(diaSemana = '', horaInicio = '', horaFin = '') {
    return this.fb.group({
      diaSemana: [diaSemana, Validators.required],
      horaInicio: [horaInicio, Validators.required],
      horaFin: [horaFin, Validators.required],
    });
  }

  // ─── CARGA ─────────────────────────────────────────────────
  private cargarAsignaciones() {
    this.isLoading.set(true);
    this.clientesSvc.getById(this.clienteId).subscribe({
      next: (cliente) => {
        this.asignaciones.set(
          (cliente.trabajadoresAsignados || []).map((ct: any) => ({
            id: ct.id,
            trabajador: ct.trabajador,
            tipoTerapia: ct.tipoTerapia,
            activo: ct.activo,
            horarios: ct.horarios || [],
            createdAt: new Date(ct.createdAt),
          })),
        );
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  // ─── AÑADIR TERAPEUTA ──────────────────────────────────────
  abrirModalAniadir() {
    this.trabajadorSvc.getTrabajadores().subscribe();
    this.formAniadir.reset({ trabajadorId: '', tipoTerapia: '' });
    this.horariosAniadir.clear();
    this.agregarHorarioAniadir(); // Al menos uno por defecto
    this.errorAsignacion.set(null);
    this.mostrarModalAniadir.set(true);
  }

  cerrarModalAniadir() {
    this.mostrarModalAniadir.set(false);
    this.errorAsignacion.set(null);
  }

  agregarHorarioAniadir() {
    this.horariosAniadir.push(this.crearHorarioGroup());
  }

  quitarHorarioAniadir(i: number) {
    if (this.horariosAniadir.length > 1) this.horariosAniadir.removeAt(i);
  }

  guardarAsignacion() {
    if (this.formAniadir.invalid) {
      this.formAniadir.markAllAsTouched();
      return;
    }

    this.guardandoAsignacion.set(true);
    this.errorAsignacion.set(null);

    const { trabajadorId, tipoTerapia, horarios } = this.formAniadir.value;

    this.clientesSvc
      .asignarTrabajador(this.clienteId, {
        trabajadorId: trabajadorId!,
        tipoTerapia: tipoTerapia!,
        horarios: (horarios as any[]).map((h) => ({
          diaSemana: Number(h.diaSemana),
          horaInicio: h.horaInicio,
          horaFin: h.horaFin,
        })),
      })
      .subscribe({
        next: () => {
          this.guardandoAsignacion.set(false);
          this.cerrarModalAniadir();
          this.cargarAsignaciones();
        },
        error: (err) => {
          this.guardandoAsignacion.set(false);
          this.errorAsignacion.set(
            err?.error?.message || 'Error al asignar terapeuta.',
          );
        },
      });
  }

  // ─── EDITAR HORARIOS ───────────────────────────────────────
  abrirModalHorarios(asignacion: Asignacion) {
    this.asignacionEditando.set(asignacion);
    this.horariosEditar.clear();
    if (asignacion.horarios.length > 0) {
      asignacion.horarios.forEach((h) =>
        this.horariosEditar.push(
          this.crearHorarioGroup(String(h.diaSemana), h.horaInicio, h.horaFin),
        ),
      );
    } else {
      this.horariosEditar.push(this.crearHorarioGroup());
    }
    this.errorHorarios.set(null);
    this.mostrarModalHorarios.set(true);
  }

  cerrarModalHorarios() {
    this.mostrarModalHorarios.set(false);
    this.asignacionEditando.set(null);
    this.errorHorarios.set(null);
  }

  agregarHorarioEditar() {
    this.horariosEditar.push(this.crearHorarioGroup());
  }

  quitarHorarioEditar(i: number) {
    if (this.horariosEditar.length > 1) this.horariosEditar.removeAt(i);
  }

  guardarHorarios() {
    if (this.formHorarios.invalid) {
      this.formHorarios.markAllAsTouched();
      return;
    }
    const asignacion = this.asignacionEditando();
    if (!asignacion) return;

    this.guardandoHorarios.set(true);
    this.errorHorarios.set(null);

    const horarios = (this.formHorarios.value.horarios as any[]).map((h) => ({
      diaSemana: Number(h.diaSemana),
      horaInicio: h.horaInicio,
      horaFin: h.horaFin,
    }));

    // Ya no hay paso de confirmacion: actualizar estos horarios no toca ninguna
    // sesion. Las sesiones las gobierna el contrato.
    this.clientesSvc
      .actualizarHorarios(this.clienteId, asignacion.id, horarios)
      .subscribe({
        next: () => {
          this.guardandoHorarios.set(false);
          this.cerrarModalHorarios();
          this.cargarAsignaciones();
        },
        error: (err) => {
          this.guardandoHorarios.set(false);
          this.errorHorarios.set(
            err?.error?.message || 'Error al actualizar horarios.',
          );
        },
      });
  }

  /*
   * El bloque "Generar sesiones" se retiro (2026-08-31). Generaba sesiones desde
   * los horarios de la asignacion, en paralelo al generador del contrato y sin
   * saber de el: dos fuentes escribiendo la misma tabla. Ademas no respetaba
   * festivos ni vacaciones y dejaba las sesiones sin contrato, con lo que no eran
   * facturables ni se cancelaban al finalizar el contrato.
   *
   * El horario recurrente se define ahora en la pestaña Contratos.
   */

  // ─── DESASIGNAR ────────────────────────────────────────────
  desasignarTrabajador(asignacionId: string) {
    this.confirmMsg.set('Se eliminarán los horarios. Las sesiones ya generadas no se eliminarán.');
    this.pendingAction.set(() => {
      this.clientesSvc.desasignarTrabajador(this.clienteId, asignacionId).subscribe({
        next: () => this.cargarAsignaciones(),
        error: (err) => console.error('❌ Error al desasignar:', err),
      });
    });
  }

  onConfirmado() { this.pendingAction()?.(); this.pendingAction.set(null); }
  onCancelado()  { this.pendingAction.set(null); }

  // ─── HELPERS ───────────────────────────────────────────────
  getDiaNombre(dia: number): string {
    return this.DIAS_CORTO[dia] ?? '?';
  }

  getBadgeClass(tipo: string): string {
    const m: Record<string, string> = {
      // gb-badge en vez de Bootstrap: `bg-info` (#0dcaf0) con texto blanco daba
      // 1.96, muy por debajo del minimo, y ninguno pertenecia a la paleta.
      PEDAGOGIA:          'gb-badge gb-badge--acento',
      NEUROPSICOLOGIA:    'gb-badge gb-badge--info',
      LOGOPEDIA:          'gb-badge gb-badge--exito',
      TERAPIA_OCUPACIONAL:'gb-badge gb-badge--peligro',
      EVALUACION:         'gb-badge gb-badge--aviso',
      REUNION_COLEGIO:    'gb-badge gb-badge--neutro',
    };
    return m[tipo] || 'bg-secondary';
  }

  // Trabajadores que aún no están asignados con el mismo tipo de terapia
  trabajadoresFiltered = computed(() => {
    const asignados = new Set(
      this.asignaciones().map((a) => `${a.trabajador.id}_${a.tipoTerapia}`),
    );
    const tipoSel = this.formAniadir.get('tipoTerapia')?.value;
    return this.trabajadoresDisponibles().filter(
      (t) => !asignados.has(`${t.id}_${tipoSel}`),
    );
  });

}

export default TrabajadorTabComponent;
