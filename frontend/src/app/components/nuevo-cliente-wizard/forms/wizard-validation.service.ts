import { Injectable } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';

/**
 * Reglas de avance del wizard. Orden:
 * 0 Datos básicos · 1 Familia · 2 Sanitario · 3 Colegio · 4 Horario · 5 Asignación · 6 Resumen
 *
 * Los pasos opcionales (Sanitario, Colegio, Asignación) dejan avanzar vacíos, pero
 * NO con datos a medias que tengan errores: un email mal escrito debe frenar aquí,
 * no reventar al guardar el cliente entero.
 */
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
      case 0: // Datos básicos — obligatorio
        return forms.datosBasicos.valid;

      case 1: {
        // Familia — obligatorio: al menos un contacto y exactamente un principal
        const contactos = forms.familia.get('contactos') as FormArray;
        if (!forms.familia.valid || contactos.length === 0) return false;
        const principales = contactos.controls.filter(
          (c) => c.get('esPrincipal')?.value === true,
        ).length;
        return principales === 1;
      }

      case 2: // Sanitario — opcional, pero sin errores
        return forms.sanitario.valid;

      case 3: // Colegio — opcional, pero sin errores
        return forms.colegio.valid;

      case 4: {
        // Horario — obligatorio: al menos un tramo, con rangos coherentes
        const disponibilidades = forms.horario.get('disponibilidades') as FormArray;
        return forms.horario.valid && disponibilidades.length > 0;
      }

      case 5: // Asignación — opcional (puede asignarse más tarde)
        return forms.asignacion.valid;

      case 6: // Resumen
        return true;

      default:
        return false;
    }
  }
}
