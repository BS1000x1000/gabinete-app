import { Component, Input } from '@angular/core';

/**
 * Los tres estados que toda pantalla de listado repite: cargando, error y sin
 * datos. Estaban copiados en las cinco pantallas del bloque de administración
 * con el mismo marcado y textos ligeramente distintos.
 *
 * Reutilizan las clases `adm-*` que ya define `sass/components/_administracion.scss`:
 * son componentes de marcado, no de estilo.
 */

@Component({
  selector: 'app-estado-carga',
  standalone: true,
  template: `
    <div class="adm-loading">
      <span class="spinner-border spinner-border-sm me-2"></span>{{ texto }}
    </div>
  `,
})
export class EstadoCargaComponent {
  @Input() texto = 'Cargando…';
}

@Component({
  selector: 'app-estado-error',
  standalone: true,
  template: `
    <div class="adm-alert adm-alert-danger">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ texto }}
    </div>
  `,
})
export class EstadoErrorComponent {
  @Input() texto = 'Ha ocurrido un error.';
}

@Component({
  selector: 'app-estado-vacio',
  standalone: true,
  template: `
    <div class="adm-empty">
      <div class="adm-empty-icon"><i class="bi" [class]="'bi ' + icono"></i></div>
      <p class="adm-empty-title">{{ titulo }}</p>
      @if (descripcion) {
        <p class="adm-empty-desc">{{ descripcion }}</p>
      }
    </div>
  `,
})
export class EstadoVacioComponent {
  @Input() icono = 'bi-inbox';
  @Input() titulo = 'Sin datos';
  @Input() descripcion = '';
}
