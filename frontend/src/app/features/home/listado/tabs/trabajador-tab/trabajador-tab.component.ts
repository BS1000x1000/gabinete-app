import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormArray,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClientesService } from '../../../../../services/cliente.service';
import { SesionesService } from '../../../../../services/sesiones.service';
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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trabajador-tab.component.html',
})
export class TrabajadorTabComponent implements OnInit {
  private clientesSvc = inject(ClientesService);
  private sesionesSvc = inject(SesionesService);
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
  confirmacionPendiente = signal<{
    sesionesFuturas: number;
    mensaje: string;
  } | null>(null);

  formHorarios = this.fb.group({
    horarios: this.fb.array([]),
  });

  get horariosEditar(): FormArray {
    return this.formHorarios.get('horarios') as FormArray;
  }

  // ─── MODAL: GENERAR SESIONES ───────────────────────────────
  mostrarModalGenerar = signal(false);
  asignacionSeleccionada = signal<Asignacion | null>(null);
  generando = signal(false);
  resultadoGeneracion = signal<{ sesionesCreadas: number } | null>(null);
  errorGeneracion = signal<string | null>(null);

  fechaHoy = new Date().toISOString().split('T')[0];
  fechaUnAnio = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    .toISOString()
    .split('T')[0];

  formGenerar = this.fb.group({
    fechaInicio: [this.fechaHoy, Validators.required],
    fechaFin: [this.fechaUnAnio, Validators.required],
    tipoSesion: ['PEDAGOGIA', Validators.required],
  });

  fechaInicioSignal = signal<string>(this.fechaHoy);
  fechaFinSignal = signal<string>(this.fechaUnAnio);

  // ─── LIFECYCLE ─────────────────────────────────────────────
  ngOnInit() {
    this.clienteId = this.route.parent?.snapshot.paramMap.get('id') || '';
    if (this.clienteId) this.cargarAsignaciones();

    this.formGenerar.get('fechaInicio')!.valueChanges.subscribe((v) => {
      if (v) this.fechaInicioSignal.set(v);
    });
    this.formGenerar.get('fechaFin')!.valueChanges.subscribe((v) => {
      if (v) this.fechaFinSignal.set(v);
    });
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
    this.confirmacionPendiente.set(null);
    this.mostrarModalHorarios.set(true);
  }

  cerrarModalHorarios() {
    this.mostrarModalHorarios.set(false);
    this.asignacionEditando.set(null);
    this.errorHorarios.set(null);
    this.confirmacionPendiente.set(null);
  }

  agregarHorarioEditar() {
    this.horariosEditar.push(this.crearHorarioGroup());
  }

  quitarHorarioEditar(i: number) {
    if (this.horariosEditar.length > 1) this.horariosEditar.removeAt(i);
  }

  guardarHorarios(confirmar: boolean = false) {
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

    this.clientesSvc
      .actualizarHorarios(this.clienteId, asignacion.id, horarios, confirmar)
      .subscribe({
        next: (res) => {
          this.guardandoHorarios.set(false);

          // El backend pide confirmación → mostrar aviso en el modal
          if (res.requiereConfirmacion) {
            this.confirmacionPendiente.set({
              sesionesFuturas: res.sesionesFuturas,
              mensaje: res.mensaje,
            });
            return;
          }

          // Todo OK → cerrar y recargar
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

  // Confirmar la actualización con migración de sesiones
  confirmarActualizacionHorarios() {
    this.confirmacionPendiente.set(null);
    this.guardarHorarios(true);
  }

  // ─── GENERAR SESIONES ──────────────────────────────────────
  abrirModalGenerar(asignacion: Asignacion) {
    this.asignacionSeleccionada.set(asignacion);
    this.resultadoGeneracion.set(null);
    this.errorGeneracion.set(null);
    this.formGenerar.patchValue({
      tipoSesion: asignacion.tipoTerapia,
      fechaInicio: this.fechaHoy,
      fechaFin: this.fechaUnAnio,
    });
    this.fechaInicioSignal.set(this.fechaHoy);
    this.fechaFinSignal.set(this.fechaUnAnio);
    this.mostrarModalGenerar.set(true);
  }

  cerrarModalGenerar() {
    this.mostrarModalGenerar.set(false);
    this.asignacionSeleccionada.set(null);
    this.resultadoGeneracion.set(null);
    this.errorGeneracion.set(null);
  }

  generarSesiones() {
    if (this.formGenerar.invalid) return;
    const asignacion = this.asignacionSeleccionada();
    if (!asignacion) return;

    this.generando.set(true);
    this.errorGeneracion.set(null);
    this.resultadoGeneracion.set(null);

    const { fechaInicio, fechaFin, tipoSesion } = this.formGenerar.value;

    this.sesionesSvc
      .generarSesiones({
        clienteId: this.clienteId,
        trabajadorId: asignacion.trabajador.id,
        fechaInicio: fechaInicio!,
        fechaFin: fechaFin!,
        tipoSesion: tipoSesion!,
      })
      .subscribe({
        next: (res) => {
          this.generando.set(false);
          this.resultadoGeneracion.set({
            sesionesCreadas: res.sesionesCreadas,
          });
        },
        error: (err) => {
          this.generando.set(false);
          this.errorGeneracion.set(
            err?.error?.message || 'Error al generar sesiones.',
          );
        },
      });
  }

  // ─── DESASIGNAR ────────────────────────────────────────────
  desasignarTrabajador(asignacionId: string) {
    if (
      !confirm(
        '¿Eliminar esta asignación y sus horarios? Las sesiones ya generadas no se eliminarán.',
      )
    )
      return;
    this.clientesSvc
      .desasignarTrabajador(this.clienteId, asignacionId)
      .subscribe({
        next: () => this.cargarAsignaciones(),
        error: (err) => console.error('❌ Error al desasignar:', err),
      });
  }

  // ─── HELPERS ───────────────────────────────────────────────
  getDiaNombre(dia: number): string {
    return this.DIAS_CORTO[dia] ?? '?';
  }

  getBadgeClass(tipo: string): string {
    const m: Record<string, string> = {
      PEDAGOGIA:          'bg-primary',
      NEUROPSICOLOGIA:    'bg-info',
      LOGOPEDIA:          'bg-success',
      TERAPIA_OCUPACIONAL:'bg-danger',
      EVALUACION:         'bg-warning text-dark',
      REUNION_COLEGIO:    'bg-secondary',
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

  sesionesEstimadas = computed(() => {
    const asig = this.asignacionSeleccionada();
    const fi = this.fechaInicioSignal();
    const ff = this.fechaFinSignal();
    if (!asig || !fi || !ff) return 0;
    const inicio = new Date(fi + 'T12:00:00');
    const fin = new Date(ff + 'T12:00:00');
    if (inicio > fin) return 0;
    const dias = new Set(asig.horarios.map((h) => h.diaSemana));
    let count = 0;
    const cur = new Date(inicio);
    while (cur <= fin) {
      if (dias.has(cur.getDay())) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  });
}

export default TrabajadorTabComponent;
