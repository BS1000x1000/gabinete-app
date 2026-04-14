import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ClientesService } from '../services/cliente.service';

export function dniUnicoValidator(
  clientesSvc: ClientesService,
  debounce: number = 1000
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const dni = control.value;

    if (!dni) return of(null);
    if (dni.length !== 9) return of(null);

    const dniPattern = /^\d{8}[A-Z]$/;
    if (!dniPattern.test(dni)) return of(null);

    return of(dni).pipe(
      debounceTime(debounce),
      distinctUntilChanged(),
      switchMap(dniValue =>
        clientesSvc.verificarDniDisponible(dniValue).pipe(
          map(response =>
            response.disponible ? null : { dniDuplicado: { mensaje: response.mensaje } }
          ),
          catchError(err => { console.error('DNI validation request failed', err?.status); return of(null); })
        )
      )
    );
  };
}
