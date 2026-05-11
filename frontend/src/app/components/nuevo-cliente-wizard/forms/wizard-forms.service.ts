import { Injectable, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { ClientesService } from '../../../services/cliente.service';
import { dniUnicoValidator } from '../../../validators/dni-unico.validator';

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
        [Validators.pattern(/^\d{8}[A-Z]$/)],
        [dniUnicoValidator(this.clientesSvc, 800)],
      ],
      fechaNacimiento: ['', Validators.required],
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
      telefono: [''],
      email: ['', Validators.email],
      contactoDos: [''],
      telefonoDos: [''],
      emailDos: ['', Validators.email],
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
      dni: ['', Validators.pattern(/^\d{8}[A-Z]$/)],
      parentesco: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
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
      medicacion: [''],
      alergias: [''],
      adaptaciones: [false],
      tipoAdaptaciones: [''],
      apoyos: [false],
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
    return this.fb.group({
      diaSemana: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
    });
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

  crearEspecialista(): FormControl {
    return this.fb.control('', Validators.required);
  }
}
