/**
 * Espejo de `backend/src/roles/roles.constants.ts`.
 *
 * Los roles estaban escritos como literales sueltos en cada fichero de rutas y
 * el sidebar decidía por lista negra (`!isRecep()`) mientras las rutas usaban
 * lista blanca: en cuanto se añadiera un rol nuevo, el menú habría enseñado
 * enlaces que el guard rebota. Si esto cambia, cambia también en el backend.
 */

export const ROL_ADMIN = 'ADMIN';
export const ROL_RECEP = 'RECEP';

/** Acceso clínico: ven y editan el expediente. */
export const ROLES_CLINICOS = ['ADMIN', 'PEDAGOGO', 'NEURO', 'LOGOPEDA'] as const;

/** Visión global del gabinete y gestión administrativa de agenda y altas. */
export const ROLES_GESTION = ['ADMIN', 'RECEP'] as const;

/** Todo el que tiene ficha de trabajador. */
export const ROLES_FICHA = [...ROLES_CLINICOS, ROL_RECEP] as const;

/**
 * El bloque administrativo (contratos, facturas, ingresos) es de cada autónomo:
 * la facturación no es asunto de recepción.
 */
export const ROLES_ADMINISTRACION = ROLES_CLINICOS;

export type RolCodigo = (typeof ROLES_FICHA)[number];
