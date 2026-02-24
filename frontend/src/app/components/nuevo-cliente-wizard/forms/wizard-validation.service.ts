import { Injectable } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';

@Injectable()
export class WizardValidationService {
  validarPaso(
    paso: number,
    forms: {
      datosBasicos: FormGroup;
      colegio: FormGroup;
      familia: FormGroup;
      sanitario: FormGroup;
      horario: FormGroup;
      asignacion: FormGroup;
    },
  ): boolean {
    switch (paso) {
      case 0: // Datos básicos
        return forms.datosBasicos.valid;

      case 1: // Colegio (opcional)
        return true;

      case 2: // Familia
        const contactos = forms.familia.get('contactos') as FormArray;
        return forms.familia.valid && contactos.length > 0;

      case 3: // Sanitario (opcional)
        return true;

      case 4: // Horario
        const disponibilidades = forms.horario.get(
          'disponibilidades',
        ) as FormArray;
        return forms.horario.valid && disponibilidades.length > 0;

      case 5: // Objetivos (opcional)
        return true;

      // case 6: // Asignación
      //   const asignaciones = forms.asignacion.get('asignaciones') as FormArray;
      //   return forms.asignacion.valid && asignaciones.length > 0;
      case 6: // Asignación (opcional)
        return true;

      case 7: // Resumen
        return true;

      default:
        return false;
    }
  }
}
