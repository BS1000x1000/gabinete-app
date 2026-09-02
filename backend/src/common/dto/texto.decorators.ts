import { Transform } from 'class-transformer';

/**
 * Recorta los espacios de un campo de texto antes de validarlo y guardarlo.
 *
 * Hace falta porque los formularios mandan lo que el usuario teclea, espacios
 * incluidos, y varios de estos campos acaban **impresos en un documento fiscal**:
 * en la base de datos se llegaron a guardar un NIF `"12345678Z "` y un código
 * postal `"28013 "`. En papel no se ve, pero está ahí y viaja al libro que recibe
 * la gestoría.
 *
 * No convierte la cadena vacía en `undefined` a propósito: los servicios aplican
 * los cambios con `...(dto.x !== undefined && { x: dto.x })`, así que con
 * `undefined` **vaciar un campo dejaría el valor anterior** en vez de borrarlo.
 */
export const Trim = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  );

/**
 * Igual que `Trim`, pero además en mayúsculas. Para códigos que se escriben en
 * mayúscula por norma y que la gente teclea como quiere: IBAN, BIC/SWIFT, NIF.
 */
export const TrimUpper = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  );

/**
 * Condición para `@ValidateIf`: valida solo si hay algo escrito.
 *
 * `@IsOptional()` de class-validator **solo salta con `null` o `undefined`**, y un
 * formulario a medio rellenar manda cadena vacía. Sin esto, guardar una ficha con
 * un campo de formato (email, IBAN, SWIFT) en blanco devolvía un 400 — que es el
 * estado normal de una ficha que se completa a trozos.
 */
export const siTieneValor = (_: unknown, v: unknown): boolean =>
  v !== '' && v != null;
