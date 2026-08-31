import {
  Component,
  inject,
  signal,
  computed,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ClientesService } from '../../services/cliente.service';
import { WizardFormsService } from './forms/wizard-forms.service';
import { WizardValidationService } from './forms/wizard-validation.service';
import {
  WIZARD_STEPS,
  WizardStep,
  ESPECIALISTAS_COLEGIO,
  ESPECIALISTAS_SANITARIOS,
} from './models/wizard-step.interface';
import { TrabajadorService } from '../../services/trabajadores.service';
import { EdadPipe } from '../../shared/pipes/edad.pipe';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-nuevo-cliente-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EdadPipe, ConfirmModalComponent],
  providers: [WizardFormsService, WizardValidationService],
  templateUrl: './nuevo-cliente-wizard.component.html',
})
export class NuevoClienteWizardComponent {
  private clientesSvc = inject(ClientesService);
  private formsService = inject(WizardFormsService);
  private trabajadorSvc = inject(TrabajadorService);
  private validationService = inject(WizardValidationService);

  @Output() cerrar = new EventEmitter<void>();
  @Output() clienteCreado = new EventEmitter<any>();

  pasoActual = signal(0);
  isSubmitting = signal(false);
  formChanged = signal(0);
  pendingClose = signal(false);
  /** Se activa al intentar avanzar con el paso incompleto. */
  mostrarAvisoValidacion = signal(false);
  pasos: WizardStep[] = WIZARD_STEPS.map(s => ({ ...s }));

  formDatosBasicos!: FormGroup;
  formColegio!: FormGroup;
  formFamilia!: FormGroup;
  formSanitario!: FormGroup;

  consentimientoMarcado = signal(false);
  trabajadores = this.trabajadorSvc.trabajadores;

  readonly ESPECIALISTAS_COLEGIO = ESPECIALISTAS_COLEGIO;
  readonly ESPECIALISTAS_SANITARIOS = ESPECIALISTAS_SANITARIOS;

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
    this.cargarTrabajadores();
  }

  private initForms() {
    this.formDatosBasicos = this.formsService.crearFormDatosBasicos();
    this.formColegio = this.formsService.crearFormColegio();
    this.formFamilia = this.formsService.crearFormFamilia();
    this.formSanitario = this.formsService.crearFormSanitario();
  }

  private setupFormListeners() {
    this.formDatosBasicos.valueChanges.subscribe(() =>
      this.formChanged.update((v) => v + 1),
    );
    this.formFamilia.valueChanges.subscribe(() =>
      this.formChanged.update((v) => v + 1),
    );
  }

  get contactos(): FormArray {
    return this.formFamilia.get('contactos') as FormArray;
  }

  /** Profesionales sanitarios externos (psicologo, logopeda...). */
  get especialistasSanitarios(): FormArray {
    return this.formSanitario.get('especialistas') as FormArray;
  }

  /** Especialistas del centro escolar (PT, AL, orientador...). */
  get especialistasColegio(): FormArray {
    return this.formColegio.get('especialistas') as FormArray;
  }

  agregarContacto() {
    this.contactos.push(this.formsService.crearContacto());
  }

  eliminarContacto(index: number) {
    if (this.contactos.length > 1) this.contactos.removeAt(index);
  }

  // ── Especialistas: sugeridos (chip) + libres (input) ────────

  private arrayEspecialistas(ambito: 'colegio' | 'sanitario'): FormArray {
    return ambito === 'colegio' ? this.especialistasColegio : this.especialistasSanitarios;
  }

  agregarEspecialista(ambito: 'colegio' | 'sanitario') {
    this.arrayEspecialistas(ambito).push(this.formsService.crearEspecialista());
    this.formChanged.update((v) => v + 1);
  }

  eliminarEspecialista(ambito: 'colegio' | 'sanitario', index: number) {
    this.arrayEspecialistas(ambito).removeAt(index);
    this.formChanged.update((v) => v + 1);
  }

  /** Marca/desmarca un especialista del catalogo sugerido. */
  toggleEspecialista(ambito: 'colegio' | 'sanitario', valor: string) {
    const arr = this.arrayEspecialistas(ambito);
    const idx = arr.controls.findIndex((c) => c.value === valor);
    if (idx >= 0) arr.removeAt(idx);
    else arr.push(this.formsService.crearEspecialista(valor));
    this.formChanged.update((v) => v + 1);
  }

  esEspecialistaActivo(ambito: 'colegio' | 'sanitario', valor: string): boolean {
    return this.arrayEspecialistas(ambito).controls.some((c) => c.value === valor);
  }

  /** Indices de especialistas escritos a mano (no vienen del catalogo). */
  indicesEspecialistasLibres(ambito: 'colegio' | 'sanitario'): number[] {
    const catalogo: readonly string[] =
      ambito === 'colegio' ? ESPECIALISTAS_COLEGIO : ESPECIALISTAS_SANITARIOS;
    return this.arrayEspecialistas(ambito)
      .controls.map((c, i) => ({ v: c.value, i }))
      .filter((x) => !catalogo.includes(x.v))
      .map((x) => x.i);
  }

  // ── Estado visual de un campo (error / exito) ───────────────

  /** Muestra error solo cuando el usuario ya ha interactuado con el campo. */
  campoInvalido(form: FormGroup | FormArray, ruta: string): boolean {
    const c = form.get(ruta);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  /** Tick verde solo si el campo tiene contenido y es valido. */
  campoValido(form: FormGroup | FormArray, ruta: string): boolean {
    const c = form.get(ruta);
    return !!c && c.valid && (c.dirty || c.touched) && !!c.value;
  }

  /** Primer mensaje de error legible para el campo. */
  mensajeError(form: FormGroup | FormArray, ruta: string): string {
    const c = form.get(ruta);
    if (!c?.errors) return '';
    const e = c.errors;
    if (e['required']) return 'Este campo es obligatorio';
    if (e['minlength']) return `Minimo ${e['minlength'].requiredLength} caracteres`;
    if (e['email']) return 'Email no valido (ej. nombre@dominio.com)';
    if (e['pattern']) {
      if (ruta.toLowerCase().includes('dni')) return 'Formato: 8 digitos y una letra (12345678Z)';
      if (ruta.toLowerCase().includes('telefono')) return 'Telefono de 9 digitos que empiece por 6, 7, 8 o 9';
      return 'Formato no valido';
    }
    if (e['fechaFutura']) return 'La fecha no puede ser futura';
    if (e['fechaDemasiadoAntigua']) return 'Fecha fuera de rango (maximo 25 anos)';
    if (e['fechaInvalida']) return 'Fecha no valida';
    if (e['dniDuplicado']) return 'Ya existe un cliente con este DNI';
    return 'Revisa este campo';
  }

  /** Errores a nivel de grupo (p. ej. rango horario invertido). */
  grupoInvalido(grupo: FormGroup | FormArray, error: string): boolean {
    return !!grupo.errors?.[error] && (grupo.dirty || grupo.touched);
  }

  /** Exactamente un contacto principal: regla de negocio del paso Familia. */
  get contactosPrincipales(): number {
    return this.contactos.controls.filter((c) => c.get('esPrincipal')?.value === true).length;
  }

  /** Marca todo el formulario como tocado para revelar los errores al intentar avanzar. */
  private revelarErrores(form: FormGroup): void {
    form.markAllAsTouched();
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

  /**
   * El boton sigue activo aunque el paso no valide: bloquearlo sin explicar por que
   * deja al usuario atascado sin pistas. Al pulsar, revelamos los errores.
   */
  siguiente() {
    if (!this.puedeAvanzar()) {
      this.revelarErrores(this.formDelPaso(this.pasoActual()));
      this.mostrarAvisoValidacion.set(true);
      this.formChanged.update((v) => v + 1);
      return;
    }

    this.mostrarAvisoValidacion.set(false);
    this.pasos[this.pasoActual()].completado = true;

    if (this.esUltimoPaso()) {
      this.crearCliente();
    } else {
      this.pasoActual.update((v) => v + 1);
    }
  }

  /** Formulario asociado a cada paso, para poder marcarlo entero como tocado. */
  private formDelPaso(paso: number): FormGroup {
    switch (paso) {
      case 0: return this.formDatosBasicos;
      case 1: return this.formFamilia;
      case 2: return this.formSanitario;
      default: return this.formColegio;
    }
  }

  /** Motivos concretos por los que el paso actual no deja avanzar. */
  readonly motivosBloqueo = computed<string[]>(() => {
    this.formChanged();
    const paso = this.pasoActual();
    const motivos: string[] = [];

    if (paso === 0 && this.formDatosBasicos.invalid) {
      motivos.push('Revisa los datos basicos marcados en rojo.');
    }

    if (paso === 1) {
      if (this.contactos.length === 0) {
        motivos.push('Anade al menos un contacto familiar.');
      } else if (this.formFamilia.invalid) {
        motivos.push('Hay contactos con datos incompletos o mal escritos.');
      }
      const principales = this.contactosPrincipales;
      if (principales === 0) motivos.push('Marca cual es el contacto principal.');
      if (principales > 1) motivos.push('Solo puede haber un contacto principal.');
    }

    if (paso === 2 && this.formSanitario.invalid) {
      motivos.push('Hay un especialista sanitario sin nombre.');
    }

    if (paso === 3 && this.formColegio.invalid) {
      motivos.push('Revisa el email o el telefono del colegio.');
    }

    if (this.esUltimoPaso() && !this.consentimientoMarcado()) {
      motivos.push('Debes confirmar el consentimiento RGPD para crear el cliente.');
    }

    return motivos;
  });

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

  private cargarTrabajadores() {
    this.trabajadorSvc.getTrabajadores().subscribe({
      next: () => {},
      error: (err) => {
        console.error('❌ Error al cargar trabajadores:', err);
        alert('Error al cargar la lista de terapeutas');
      },
    });
  }

  private crearCliente() {
    this.isSubmitting.set(true);


    const clienteData = {
      nombre: this.formDatosBasicos.value.nombre,
      apellidos: this.formDatosBasicos.value.apellidos,
      // El DNI es opcional: se envia null, nunca '' (ver normalizarDni en el backend)
      dni: this.formDatosBasicos.value.dni?.trim().toUpperCase() || null,
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
            ctoEmailColegioUno: this.formColegio.value.email || null,
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
          email: contacto.email || null,
          esResponsablePago: contacto.esPago || false,
          esContactoPrincipal: contacto.esPrincipal || false,
          esTutorLegal: contacto.esTutorLegal || false,
          whatsapp: false,
        };
      }),

      // Sanitario: solo profesionales externos y datos clinicos
      datosSanitarios: {
        diagnostico: this.formSanitario.value.diagnostico || '',
        centroSalud: this.formSanitario.value.centroSalud || '',
        tratamientos: this.formSanitario.value.tratamientos || '',
        especialistas: (this.formSanitario.value.especialistas || []).filter(
          (e: string) => !!e?.trim(),
        ),
      },

      // Escolar: situacion DEL NINO en el centro (no del centro en si)
      datosEscolares: {
        adaptaciones: this.formColegio.value.adaptaciones || false,
        tipoAdaptaciones: this.formColegio.value.tipoAdaptaciones || null,
        apoyos: this.formColegio.value.apoyos || false,
        especialistas: (this.formColegio.value.especialistas || []).filter(
          (e: string) => !!e?.trim(),
        ),
      },

      // Sin horario ni terapeuta: los define el contrato. El backend asigna
      // automaticamente a quien da de alta para que no pierda de vista la ficha.

      consentimientoRgpd: this.consentimientoMarcado(),
    };

    this.clientesSvc.create(clienteData).subscribe({
      next: (nuevoCliente) => {
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
    const v = this.formSanitario.value;
    return {
      ...v,
      especialistas: (v.especialistas ?? []).filter((e: string) => !!e?.trim()),
    };
  }

  /** Situación escolar del alumno: se captura en el paso Colegio pero es del niño. */
  getResumenEscolar() {
    const v = this.formColegio.value;
    return {
      adaptaciones: v.adaptaciones ?? false,
      tipoAdaptaciones: v.tipoAdaptaciones ?? '',
      apoyos: v.apoyos ?? false,
      especialistas: (v.especialistas ?? []).filter((e: string) => !!e?.trim()),
    };
  }
  toggleConsentimiento() {
    this.consentimientoMarcado.update((v) => !v);
  }

  private tieneDatosIngresados(): boolean {
    return (
      this.pasoActual() > 0 ||
      this.formDatosBasicos.dirty ||
      this.formFamilia.dirty ||
      this.formColegio.dirty ||
      this.formSanitario.dirty
    );
  }

  cerrarConConfirmacion() {
    if (this.tieneDatosIngresados()) {
      this.pendingClose.set(true);
    } else {
      this.cerrarModal();
    }
  }

  onConfirmarCierre() { this.pendingClose.set(false); this.cerrarModal(); }
  onCancelarCierre()  { this.pendingClose.set(false); }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent) {
    event.stopPropagation();
    if (!this.isSubmitting()) this.cerrarConConfirmacion();
  }

  cerrarModal() {
    this.cerrar.emit();
  }

}

export default NuevoClienteWizardComponent;
