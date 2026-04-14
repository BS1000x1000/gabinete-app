import {
  Component,
  inject,
  signal,
  computed,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ClientesService } from '../../services/cliente.service';
import { ObjetivosService } from '../../services/objetivos.service';
import { WizardFormsService } from './forms/wizard-forms.service';
import { WizardValidationService } from './forms/wizard-validation.service';
import { WIZARD_STEPS, WizardStep } from './models/wizard-step.interface';
import { TrabajadorService } from '../../services/trabajadores.service';
import { EdadPipe } from '../../shared/pipes/edad.pipe';

@Component({
  selector: 'app-nuevo-cliente-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EdadPipe],
  providers: [WizardFormsService, WizardValidationService],
  templateUrl: './nuevo-cliente-wizard.component.html',
})
export class NuevoClienteWizardComponent {
  private clientesSvc = inject(ClientesService);
  private objetivosSvc = inject(ObjetivosService);
  private formsService = inject(WizardFormsService);
  private trabajadorSvc = inject(TrabajadorService);
  private validationService = inject(WizardValidationService);

  @Output() cerrar = new EventEmitter<void>();
  @Output() clienteCreado = new EventEmitter<any>();

  pasoActual = signal(0);
  isSubmitting = signal(false);
  formChanged = signal(0);
  pasos: WizardStep[] = [...WIZARD_STEPS];

  formDatosBasicos!: FormGroup;
  formColegio!: FormGroup;
  formFamilia!: FormGroup;
  formSanitario!: FormGroup;
  formHorario!: FormGroup;
  formAsignacion!: FormGroup;

  objetivosSeleccionados = signal<string[]>([]);
  consentimientoMarcado = signal(false);
  trabajadores = this.trabajadorSvc.trabajadores;

  objetivosGenerales = this.objetivosSvc.objetivosGenerales;
  areas = this.objetivosSvc.areas;

  pasoActualData = computed(() => this.pasos[this.pasoActual()]);
  esPrimerPaso = computed(() => this.pasoActual() === 0);
  esUltimoPaso = computed(() => this.pasoActual() === this.pasos.length - 1);

  puedeAvanzar = computed(() => {
    this.formChanged();
    const pasoValido = this.validationService.validarPaso(this.pasoActual(), {
      datosBasicos: this.formDatosBasicos,
      colegio: this.formColegio,
      familia: this.formFamilia,
      sanitario: this.formSanitario,
      horario: this.formHorario,
      asignacion: this.formAsignacion,
    });
    if (this.esUltimoPaso()) return pasoValido && this.consentimientoMarcado();
    return pasoValido;
  });

  progreso = computed(() => {
    const completados = this.pasos.filter((p) => p.completado).length;
    return Math.round((completados / this.pasos.length) * 100);
  });

  constructor() {
    this.initForms();
    this.setupFormListeners();
    this.cargarCatalogos();
    this.cargarTrabajadores();
  }

  private initForms() {
    this.formDatosBasicos = this.formsService.crearFormDatosBasicos();
    this.formColegio = this.formsService.crearFormColegio();
    this.formFamilia = this.formsService.crearFormFamilia();
    this.formSanitario = this.formsService.crearFormSanitario();
    this.formHorario = this.formsService.crearFormHorario();
    this.formAsignacion = this.formsService.crearFormAsignacion();

    // Inicializar con una asignación vacía
    this.agregarAsignacion();
  }

  private setupFormListeners() {
    this.formDatosBasicos.valueChanges.subscribe(() =>
      this.formChanged.update((v) => v + 1),
    );
    this.formFamilia.valueChanges.subscribe(() =>
      this.formChanged.update((v) => v + 1),
    );
    this.formHorario.valueChanges.subscribe(() =>
      this.formChanged.update((v) => v + 1),
    );
    this.formAsignacion.valueChanges.subscribe(() =>
      this.formChanged.update((v) => v + 1),
    );
  }

  get contactos(): FormArray {
    return this.formFamilia.get('contactos') as FormArray;
  }

  get disponibilidades(): FormArray {
    return this.formHorario.get('disponibilidades') as FormArray;
  }

  get horariosAsignacion(): FormArray {
    return this.formAsignacion.get('horarios') as FormArray;
  }

  get especialistas(): FormArray {
    return this.formSanitario.get('especialistas') as FormArray;
  }

  agregarContacto() {
    this.contactos.push(this.formsService.crearContacto());
  }

  eliminarContacto(index: number) {
    if (this.contactos.length > 1) this.contactos.removeAt(index);
  }

  agregarDisponibilidad() {
    this.disponibilidades.push(this.formsService.crearDisponibilidad());
  }

  eliminarDisponibilidad(index: number) {
    if (this.disponibilidades.length > 1) this.disponibilidades.removeAt(index);
  }

  agregarHorarioAsignacion() {
    this.horariosAsignacion.push(this.formsService.crearHorarioAsignacion());
  }

  eliminarHorarioAsignacion(index: number) {
    if (this.horariosAsignacion.length > 1)
      this.horariosAsignacion.removeAt(index);
  }

  agregarEspecialista() {
    this.especialistas.push(this.formsService.crearEspecialista());
  }

  eliminarEspecialista(index: number) {
    this.especialistas.removeAt(index);
  }

  toggleObjetivo(objetivoId: string) {
    this.objetivosSeleccionados.update((prev) =>
      prev.includes(objetivoId)
        ? prev.filter((id) => id !== objetivoId)
        : [...prev, objetivoId],
    );
  }

  getObjetivosPorArea(areaId: string) {
    return this.objetivosGenerales().filter(
      (o) => o.areaDesarrolloId === areaId,
    );
  }

  isObjetivoSeleccionado(objetivoId: string): boolean {
    return this.objetivosSeleccionados().includes(objetivoId);
  }

  getObjetivoTitulo(objetivoId: string): string {
    return (
      this.objetivosGenerales().find((o) => o.id === objetivoId)?.titulo || ''
    );
  }

  getDiaNombre(dia: string | number): string {
    const dias = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    return dias[Number(dia)] || '';
  }

  getTrabajadorSeleccionado(): any {
    const trabajadorId = this.formAsignacion.get('trabajadorId')?.value;
    if (!trabajadorId) return null;
    return this.trabajadores().find((t) => t.id === trabajadorId);
  }

  getNombreTrabajadorSeleccionado(): string {
    const trabajador = this.getTrabajadorSeleccionado();
    if (!trabajador) return 'No seleccionado';
    return `${trabajador.nombre} ${trabajador.apellidos}`;
  }

  siguiente() {
    if (this.puedeAvanzar()) {
      this.pasos[this.pasoActual()].completado = true;

      if (this.esUltimoPaso()) {
        this.crearCliente();
      } else {
        this.pasoActual.update((v) => v + 1);
      }
    }
  }

  anterior() {
    if (!this.esPrimerPaso()) {
      this.pasoActual.update((v) => v - 1);
    }
  }

  irAPaso(paso: number) {
    if (paso < this.pasoActual() || this.pasos[paso].completado) {
      this.pasoActual.set(paso);
    }
  }

  private cargarCatalogos() {
    this.objetivosSvc.getAreas().subscribe();
    this.objetivosSvc.getObjetivosGenerales().subscribe();
  }

  private cargarTrabajadores() {
    this.trabajadorSvc.getTrabajadores().subscribe({
      next: () => {
        console.log('✅ Trabajadores cargados para el wizard');
      },
      error: (err) => {
        console.error('❌ Error al cargar trabajadores:', err);
        alert('Error al cargar la lista de terapeutas');
      },
    });
  }

  private crearCliente() {
    this.isSubmitting.set(true);

    const asignacionesAgrupadas = this.agruparAsignacionesPorTrabajador();

    const clienteData = {
      nombre: this.formDatosBasicos.value.nombre,
      apellidos: this.formDatosBasicos.value.apellidos,
      dni: this.formDatosBasicos.value.dni,
      fechaNacimiento: this.formDatosBasicos.value.fechaNacimiento,
      curso: this.formDatosBasicos.value.curso,
      domicilio: this.formDatosBasicos.value.domicilio || '',
      ciudad: this.formDatosBasicos.value.ciudad || '',
      provincia: this.formDatosBasicos.value.provincia || '',
      fechaInicio: new Date().toISOString().split('T')[0],
      idCarpetaDrive: null,

      colegio: this.formColegio.value.nombre
        ? {
            nombre: this.formColegio.value.nombre,
            direccionColegio: this.formColegio.value.direccionColegio || '',
            ctoColegioUno: this.formColegio.value.contactoUno || '',
            ctoTelefonoUno: this.formColegio.value.telefono || '',
            ctoEmailColegioUno: this.formColegio.value.email || '',
            ctoRelacionColegioUno: 'Contacto',
            ctoColegioDos: this.formColegio.value.contactoDos || null,
            ctoTelefonoDos: this.formColegio.value.telefonoDos || null,
            ctoEmailColegioDos: this.formColegio.value.emailDos || null,
            ctoRelacionColegioDos: this.formColegio.value.contactoDos
              ? 'Contacto'
              : null,
          }
        : null,

      familiares: this.contactos.value.map((contacto: any) => {
        const nombreCompleto = contacto.nombreCompleto || '';
        const partes = nombreCompleto.trim().split(' ');
        const nombre = partes[0] || '';
        const apellidos = partes.slice(1).join(' ') || '';

        return {
          nombre,
          apellidos,
          dni: contacto.dni || '',
          parentesco: contacto.parentesco,
          telefono: contacto.telefono,
          email: contacto.email || '',
          esResponsablePago: contacto.esPago || false,
          esContactoPrincipal: contacto.esPrincipal || false,
          whatsapp: false,
        };
      }),

      datosSanitarios: {
        diagnostico: this.formSanitario.value.diagnostico || '',
        centroSalud: this.formSanitario.value.centroSalud || '',
        tratamientos: this.formSanitario.value.tratamientos || '',
        medicacion: this.formSanitario.value.medicacion || '',
        alergias: this.formSanitario.value.alergias || '',
        adaptaciones: this.formSanitario.value.adaptaciones || false,
        tipoAdaptaciones: this.formSanitario.value.tipoAdaptaciones || null,
        especialistas: this.formSanitario.value.especialistas || [],
        apoyos: this.formSanitario.value.apoyos || false,
      },

      disponibilidad: this.disponibilidades.value.map((d: any) => ({
        diaSemana: Number(d.diaSemana),
        horaInicio: d.horaInicio,
        horaFin: d.horaFin,
      })),

      objetivosGeneralesIds: this.objetivosSeleccionados(),

      asignaciones: asignacionesAgrupadas,

      consentimientoRgpd: this.consentimientoMarcado(),
    };

    this.clientesSvc.create(clienteData).subscribe({
      next: (nuevoCliente) => {
        console.log('✅ Cliente creado:', nuevoCliente);
        this.finalizarCreacion(nuevoCliente);
      },
      error: (err) => {
        console.error('❌ Error:', err);
        let errorMsg = 'Error desconocido';
        if (err.status === 409) errorMsg = 'DNI ya registrado';
        if (err.status === 400) errorMsg = 'Datos inválidos';
        alert(`❌ ${errorMsg}`);
        this.isSubmitting.set(false);
      },
    });
  }

  private agruparAsignacionesPorTrabajador() {
    // Si no hay asignaciones, retornar array vacío
    if (!this.asignaciones || this.asignaciones.length === 0) {
      return [];
    }

    const asignacionesMap = new Map<string, any>();

    this.asignaciones.value.forEach((asig: any) => {
      // Validar que tenga los datos necesarios
      if (
        !asig.trabajadorId ||
        !asig.tipoTerapia ||
        asig.disponibilidadIndex === null
      ) {
        return; // Saltar asignaciones incompletas
      }

      const key = `${asig.trabajadorId}-${asig.tipoTerapia}`;

      const dispSeleccionada =
        this.disponibilidadesDisponibles[asig.disponibilidadIndex];

      if (!dispSeleccionada) {
        return; // Saltar si no hay disponibilidad seleccionada
      }

      if (!asignacionesMap.has(key)) {
        asignacionesMap.set(key, {
          trabajadorId: asig.trabajadorId,
          tipoTerapia: asig.tipoTerapia,
          horarios: [],
        });
      }

      asignacionesMap.get(key).horarios.push({
        diaSemana: Number(dispSeleccionada.diaSemana),
        horaInicio: asig.horaInicio,
        horaFin: asig.horaFin,
      });
    });

    return Array.from(asignacionesMap.values());
  }

  private finalizarCreacion(cliente: any) {
    this.isSubmitting.set(false);
    this.clienteCreado.emit(cliente);
    this.cerrarModal();
  }

  getResumenDatosBasicos() {
    return this.formDatosBasicos.value;
  }
  getResumenColegio() {
    return this.formColegio.value;
  }
  getResumenFamilia() {
    return this.contactos.value;
  }
  getResumenSanitario() {
    return this.formSanitario.value;
  }
  getResumenHorario() {
    return this.disponibilidades.value;
  }

  toggleConsentimiento() {
    this.consentimientoMarcado.update((v) => !v);
  }

  cerrarModal() {
    this.cerrar.emit();
  }

  get asignaciones(): FormArray {
    return this.formAsignacion.get('asignaciones') as FormArray;
  }

  // ✅ NUEVO: Obtener disponibilidades del paso 4
  get disponibilidadesDisponibles() {
    return this.disponibilidades.value.map((d: any, index: number) => ({
      index,
      diaSemana: d.diaSemana,
      horaInicio: d.horaInicio,
      horaFin: d.horaFin,
      diaNombre: this.getDiaNombre(d.diaSemana),
    }));
  }

  // ✅ NUEVO: Agregar una nueva asignación
  agregarAsignacion() {
    this.asignaciones.push(this.formsService.crearAsignacionEspecifica());

    const index = this.asignaciones.length - 1;
    this.asignaciones
      .at(index)
      .get('disponibilidadIndex')
      ?.valueChanges.subscribe((dispIndex) => {
        this.autoCompletarHorario(index, dispIndex);
      });
  }

  private autoCompletarHorario(
    asignacionIndex: number,
    disponibilidadIndex: number | string | null,
  ) {
    if (disponibilidadIndex === null || disponibilidadIndex === '') return;

    const disponibilidad =
      this.disponibilidadesDisponibles[disponibilidadIndex];

    if (!disponibilidad) return;

    const asignacion = this.asignaciones.at(asignacionIndex);

    // Auto-rellenar con el horario completo
    asignacion.patchValue(
      {
        horaInicio: disponibilidad.horaInicio,
        horaFin: disponibilidad.horaFin,
      },
      { emitEvent: false },
    ); // No emitir evento para evitar loops
  }

  // ✅ NUEVO: Eliminar asignación
  eliminarAsignacion(index: number) {
    if (this.asignaciones.length > 1) {
      this.asignaciones.removeAt(index);
    }
  }

  // ✅ NUEVO: Obtener datos del horario seleccionado
  getDisponibilidadSeleccionada(index: number) {
    const asignacion = this.asignaciones.at(index);
    const dispIndex = asignacion?.get('disponibilidadIndex')?.value;

    if (dispIndex === '' || dispIndex === null) return null;

    return this.disponibilidadesDisponibles[dispIndex];
  }

  getNombreTrabajador(trabajadorId: string): string {
    const trabajador = this.trabajadores().find((t) => t.id === trabajadorId);
    if (!trabajador) return '';
    return `${trabajador.nombre} ${trabajador.apellidos}`;
  }

  // ✅ ALTERNATIVA: Si quieres solo el nombre
  getNombreTrabajadorCorto(trabajadorId: string): string {
    const trabajador = this.trabajadores().find((t) => t.id === trabajadorId);
    return trabajador?.nombre || '';
  }
}

export default NuevoClienteWizardComponent;
