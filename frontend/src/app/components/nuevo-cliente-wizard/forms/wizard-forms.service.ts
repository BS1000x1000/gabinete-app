import { Injectable, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { ClientesService } from '../../../services/cliente.service';
import { dniUnicoValidator } from '../../../validators/dni-unico.validator';

/** DNI espanol: 8 digitos + letra. */
export const DNI_ES = /^\d{8}[A-Za-z]$/;

/** Movil o fijo espanol: 9 digitos empezando por 6, 7, 8 o 9. */
export const TELEFONO_ES = /^[6789]\d{8}$/;

/** La fecha de nacimiento no puede ser futura ni de hace mas de 25 anos. */
export function fechaNacimientoValida(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const fecha = new Date(control.value);
  if (Number.isNaN(fecha.getTime())) return { fechaInvalida: true };

  if (fecha > new Date()) return { fechaFutura: true };

  const limite = new Date();
  limite.setFullYear(limite.getFullYear() - 25);
  if (fecha < limite) return { fechaDemasiadoAntigua: true };

  return null;
}

/** La hora de fin debe ser posterior a la de inicio. */
export function rangoHorarioValido(group: AbstractControl): ValidationErrors | null {
  const inicio = group.get('horaInicio')?.value;
  const fin = group.get('horaFin')?.value;
  if (!inicio || !fin) return null;
  return fin > inicio ? null : { rangoInvalido: true };
}

@Injectable()
export class WizardFormsService {
  private fb = inject(FormBuilder);
  private clientesSvc = inject(ClientesService);

  // ========================================
  // DATOS BÁSICOS
  // ========================================
  crearFormDatosBasicos(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      dni: [
        '',
        [Validators.pattern(DNI_ES)],
        [dniUnicoValidator(this.clientesSvc, 800)],
      ],
      fechaNacimiento: ['', [Validators.required, fechaNacimientoValida]],
      curso: ['', Validators.required],
      domicilio: [''],
      ciudad: [''],
      provincia: [''],
    });
  }

  // ========================================
  // COLEGIO
  // ========================================
  crearFormColegio(): FormGroup {
    return this.fb.group({
      nombre: [''],
      contactoUno: [''],
      direccionColegio: [''],
      telefono: ['', Validators.pattern(TELEFONO_ES)],
      email: ['', Validators.email],
      contactoDos: [''],
      telefonoDos: ['', Validators.pattern(TELEFONO_ES)],
      emailDos: ['', Validators.email],

      // Situacion escolar DEL NINO (modelo Escolar), no del centro:
      // el colegio se comparte entre clientes, esto no.
      adaptaciones: [false],
      tipoAdaptaciones: [''],
      apoyos: [false],
      especialistas: this.fb.array([]),
    });
  }

  // ========================================
  // FAMILIA
  // ========================================
  crearFormFamilia(): FormGroup {
    return this.fb.group({
      contactos: this.fb.array([this.crearContacto()]),
    });
  }

  crearContacto(): FormGroup {
    return this.fb.group({
      nombreCompleto: ['', Validators.required],
      dni: ['', Validators.pattern(DNI_ES)],
      parentesco: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(TELEFONO_ES)]],
      email: ['', Validators.email],
      esPrincipal: [false],
      esPago: [false],
    });
  }

  // ========================================
  // SANITARIO
  // ========================================
  crearFormSanitario(): FormGroup {
    return this.fb.group({
      diagnostico: [''],
      centroSalud: [''],
      tratamientos: [''],
      // Profesionales sanitarios EXTERNOS (psicologo, logopeda, neuropediatra...).
      // Los del colegio (PT, AL...) van en el paso de Colegio.
      especialistas: this.fb.array([]),
    });
  }

  // ========================================
  // HORARIO
  // ========================================
  crearFormHorario(): FormGroup {
    return this.fb.group({
      disponibilidades: this.fb.array([this.crearDisponibilidad()]),
    });
  }

  crearDisponibilidad(): FormGroup {
    return this.fb.group(
      {
        diaSemana: ['', Validators.required],
        horaInicio: ['', Validators.required],
        horaFin: ['', Validators.required],
      },
      { validators: rangoHorarioValido },
    );
  }

  // ========================================
  // ASIGNACIÓN
  // ========================================
  crearFormAsignacion(): FormGroup {
    return this.fb.group({
      asignaciones: this.fb.array([]), // ✅ Array de asignaciones
    });
  }

  // Crear una asignación específica
  crearAsignacionEspecifica(): FormGroup {
    return this.fb.group({
      disponibilidadIndex: ['', Validators.required], // Índice del horario general
      trabajadorId: ['', Validators.required],
      tipoTerapia: ['', Validators.required],
      horaInicio: ['', Validators.required], // Hora específica dentro del rango
      horaFin: ['', Validators.required],
    });
  }

  crearHorarioAsignacion(): FormGroup {
    return this.fb.group({
      diaSemana: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
    });
  }

  crearEspecialista(valor = ''): FormControl {
    return this.fb.control(valor, Validators.required);
  }
}
