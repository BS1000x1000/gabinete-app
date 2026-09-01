import { Component, input, output } from '@angular/core';
import { RangoPagina } from '../../utils/paginacion';

/**
 * Pie de paginacion compartido. Solo presenta: el estado vive en el
 * componente anfitrion, normalmente vía `crearPaginacion()`.
 */
@Component({
  selector: 'app-paginacion',
  standalone: true,
  template: `
    <div class="gb-paginacion">
      <span class="gb-paginacion__rango">
        {{ rango().desde }}–{{ rango().hasta }} de {{ rango().total }}
        {{ etiqueta() }}
      </span>

      @if (totalPaginas() > 1) {
        <div class="gb-paginacion__nav">
          <button
            type="button"
            [disabled]="pagina() === 1"
            (click)="cambioPagina.emit(pagina() - 1)"
            aria-label="Página anterior"
          >
            <i class="bi bi-chevron-left"></i>
          </button>
          <span class="gb-paginacion__pagina">
            Página {{ pagina() }} de {{ totalPaginas() }}
          </span>
          <button
            type="button"
            [disabled]="pagina() === totalPaginas()"
            (click)="cambioPagina.emit(pagina() + 1)"
            aria-label="Página siguiente"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      }
    </div>
  `,
})
export class PaginacionComponent {
  readonly pagina = input.required<number>();
  readonly totalPaginas = input.required<number>();
  readonly rango = input.required<RangoPagina>();
  /** Sustantivo en plural: "sesiones", "registros"... Opcional. */
  readonly etiqueta = input<string>('');

  readonly cambioPagina = output<number>();
}
