import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ClientesService } from '../services/cliente.service';

/** DNI español: 8 dígitos + letra. Se admite minúscula y se normaliza al comparar. */
const DNI_PATTERN = /^\d{8}[A-Za-z]$/;

/**
 * Comprueba contra el servidor que el DNI no esté ya registrado.
 *
 * El DNI del cliente es **opcional**: si el campo está vacío no se valida nada y
 * nunca se llama al backend — varios clientes sin DNI son perfectamente válidos.
 *
 * Nota sobre el debounce: se usa `timer(...)` como fuente, no `of(...)` con
 * `debounceTime`. Con `of` el observable completa de inmediato, lo que provoca
 * que `debounceTime` haga flush del último valor sin esperar — es decir, no había
 * debounce real y se lanzaba una petición por cada pulsación de tecla.
 */
export function dniUnicoValidator(
  clientesSvc: ClientesService,
  debounce: number = 1000,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const dni = control.value?.trim().toUpperCase();

    // Campo vacío → válido: el DNI no es obligatorio
    if (!dni) return of(null);

    // Formato incompleto o incorrecto → lo señala el validador de patrón,
    // no tiene sentido preguntar al servidor todavía
    if (!DNI_PATTERN.test(dni)) return of(null);

    return timer(debounce).pipe(
      switchMap(() =>
        clientesSvc.verificarDniDisponible(dni).pipe(
          map((response) =>
            response.disponible
              ? null
              : { dniDuplicado: { mensaje: response.mensaje } },
          ),
          // Fail-open: si la comprobación no llega, no bloqueamos el alta.
          // El backend valida igualmente y devuelve 409 si hay duplicado.
          catchError((err) => {
            console.error('DNI validation request failed', err?.status);
            return of(null);
          }),
        ),
      ),
    );
  };
}
