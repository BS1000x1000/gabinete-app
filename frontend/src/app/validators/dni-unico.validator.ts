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

    console.log('━'.repeat(60));
    console.log('🔍 VALIDADOR DNI ÚNICO - INICIO');
    console.log(`   Valor recibido: "${dni}"`);
    console.log(`   Longitud: ${dni?.length || 0}`);
    console.log(`   Tipo: ${typeof dni}`);

    // ✅ Validaciones preliminares
    if (!dni) {
      console.log('   ❌ Sin valor, saltando validación');
      console.log('━'.repeat(60));
      return of(null);
    }

    if (dni.length !== 9) {
      console.log(`   ❌ Longitud incorrecta (${dni.length} !== 9), saltando validación`);
      console.log('━'.repeat(60));
      return of(null);
    }

    const dniPattern = /^\d{8}[A-Z]$/;
    if (!dniPattern.test(dni)) {
      console.log(`   ❌ Formato incorrecto, saltando validación`);
      console.log('━'.repeat(60));
      return of(null);
    }

    console.log(`   ✅ DNI válido, procediendo a verificar en backend`);
    console.log(`   ⏳ Esperando ${debounce}ms antes de consultar...`);

    return of(dni).pipe(
      debounceTime(debounce),
      distinctUntilChanged(),
      switchMap(dniValue => {
        console.log(`   🌐 Consultando backend con DNI: "${dniValue}"`);
        
        return clientesSvc.verificarDniDisponible(dniValue).pipe(
          map(response => {
            console.log(`   📡 Respuesta del backend:`, response);
            console.log(`      - DNI consultado: "${response.dni || dniValue}"`);
            console.log(`      - Disponible: ${response.disponible}`);
            console.log(`      - Mensaje: ${response.mensaje}`);
            console.log('━'.repeat(60));
            
            return response.disponible ? null : { 
              dniDuplicado: { 
                mensaje: response.mensaje 
              } 
            };
          }),
          catchError(error => {
            console.error('   ❌ ERROR en petición HTTP:', error);
            console.log('━'.repeat(60));
            return of(null);
          })
        );
      })
    );
  };
}