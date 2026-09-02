export function toNum(
  v: { toNumber: () => number } | number | null | undefined,
  fallback = 0,
): number {
  if (v == null) return fallback;
  return typeof v === 'number' ? v : v.toNumber();
}

/** Datos fiscales del destinatario de la factura, tal y como viven en `Cliente`. */
export interface DatosPagador {
  nombreTutorPagador: string | null;
  nifTutorPagador: string | null;
}

const vacio = (v: string | null | undefined): boolean => !v || !v.trim();

/**
 * Por que ese cliente no puede recibir factura, o `null` si puede.
 *
 * El destinatario de una factura completa es el tutor pagador, con nombre y NIF
 * (RD 1619/2012 art. 6). Cuando faltaban, la factura se emitia igual y todo el
 * circuito caia al `?? nombre del menor`: el libro de la gestoria llevaba el
 * nombre del nino en la columna Destinatario, el NIF en blanco, y el PDF del
 * paquete se llamaba con el nombre del menor. Se corta en el origen.
 */
export function motivoSinDatosFiscales(cliente: DatosPagador): string | null {
  const sinNombre = vacio(cliente.nombreTutorPagador);
  const sinNif = vacio(cliente.nifTutorPagador);
  if (sinNombre && sinNif) {
    return 'Faltan el nombre y el NIF del tutor pagador en la ficha del cliente.';
  }
  if (sinNombre)
    return 'Falta el nombre del tutor pagador en la ficha del cliente.';
  if (sinNif) return 'Falta el NIF del tutor pagador en la ficha del cliente.';
  return null;
}
