// frontend/src/app/shared/pipes/edad.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { calcularEdadTexto } from '../utils/date';

@Pipe({ name: 'edad', standalone: true })
export class EdadPipe implements PipeTransform {
  transform(fechaNacimiento: string | Date | null | undefined): string {
    if (!fechaNacimiento) return 'Sin fecha';
    return calcularEdadTexto(fechaNacimiento).texto;
  }
}