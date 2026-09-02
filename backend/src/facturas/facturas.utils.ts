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

/** Datos fiscales del EMISOR de la factura, tal y como viven en `Trabajador`. */
export interface DatosEmisor {
  nifFiscal: string | null;
  direccionFiscal: string | null;
  codigoPostalFiscal: string | null;
  ciudadFiscal: string | null;
}

/**
 * Por que ese trabajador no puede expedir factura, o `null` si puede.
 *
 * El RD 1619/2012 art. 6 exige NIF y domicilio del **obligado a expedir** igual
 * que los del destinatario, y hasta ahora solo se validaba el destinatario: una
 * ficha fiscal a medias emitia igualmente, con el bloque del emisor en blanco en
 * el PDF, y **quemaba un numero de la serie correlativa que no se libera** — ni
 * siquiera al anular, que deja el hueco a proposito.
 *
 * No se exige `nombreFiscal` porque tiene fallback real a nombre + apellidos
 * (`facturas-pdf.service.ts`), asi que nunca sale vacio. Tampoco `provinciaFiscal`,
 * que no forma parte del domicilio minimo identificable.
 *
 * A diferencia del destinatario, esto se rellena **una sola vez** por autonomo,
 * asi que bloquear aqui no deja a nadie a medias: o falla para todos sus
 * contratos o para ninguno, y se arregla en la pantalla de datos fiscales.
 */
export function motivoSinDatosEmisor(trabajador: DatosEmisor): string | null {
  if (vacio(trabajador.nifFiscal)) {
    return 'Falta el NIF fiscal de la profesional en sus datos fiscales.';
  }
  const sinDomicilio =
    vacio(trabajador.direccionFiscal) ||
    vacio(trabajador.codigoPostalFiscal) ||
    vacio(trabajador.ciudadFiscal);
  if (sinDomicilio) {
    return 'Falta el domicilio fiscal completo de la profesional (dirección, código postal y ciudad) en sus datos fiscales.';
  }
  return null;
}
