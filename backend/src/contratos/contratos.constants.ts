/**
 * Cuántos meses de sesiones se generan por delante.
 *
 * Ventana móvil en vez de generar el contrato entero: un cambio de horario
 * recoloca ~13 sesiones en vez de ~50, y la BD no acumula citas de dentro de un
 * año que probablemente cambien antes de ocurrir. Un cron mensual va empujando
 * la ventana, así que la agenda siempre se ve completa a tres meses vista.
 */
export const HORIZONTE_GENERACION_MESES = 3;

/**
 * Clave del advisory lock de Postgres que serializa el cron.
 * Si algún día hay más de una réplica del contenedor, solo una genera.
 */
export const LOCK_VENTANA_MOVIL = 'contratos_ventana_movil';
