import { Signal, computed, signal } from '@angular/core';

export interface RangoPagina {
  desde: number;
  hasta: number;
  total: number;
}

/**
 * Paginacion en cliente sobre una lista ya filtrada.
 *
 * Se pagina en cliente y no en servidor a proposito: las listas que la usan o
 * fusionan dos fuentes (documentacion = informes + documentos), o se ordenan de
 * una forma que un `skip/take` no reproduce (sesiones: futuras ascendente +
 * pasadas descendente), o se filtran en memoria (registro diario).
 *
 * Devuelve signals, asi que se declara como campo de clase DESPUES del
 * `computed` de la lista filtrada que recibe. No necesita contexto de
 * inyeccion: `computed()` puede crearse fuera, solo `effect()` lo exige.
 */
export function crearPaginacion<T>(fuente: Signal<T[]>, porPagina: number) {
  const pagina = signal(1);

  const totalPaginas = computed(() =>
    Math.max(1, Math.ceil(fuente().length / porPagina)),
  );

  /** Pagina saneada: si un filtro reduce los resultados, no queda una pagina vacia. */
  const paginaActual = computed(() => Math.min(pagina(), totalPaginas()));

  const items = computed(() => {
    const inicio = (paginaActual() - 1) * porPagina;
    return fuente().slice(inicio, inicio + porPagina);
  });

  const rango = computed<RangoPagina>(() => {
    const total = fuente().length;
    if (total === 0) return { desde: 0, hasta: 0, total };
    const desde = (paginaActual() - 1) * porPagina + 1;
    return { desde, hasta: Math.min(desde + porPagina - 1, total), total };
  });

  const irAPagina = (n: number): void => {
    pagina.set(Math.min(Math.max(1, n), totalPaginas()));
  };

  /** Volver al principio: llamar desde cada cambio de filtro u orden. */
  const reiniciar = (): void => pagina.set(1);

  return { pagina, paginaActual, totalPaginas, items, rango, irAPagina, reiniciar };
}
