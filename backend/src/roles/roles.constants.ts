/**
 * Grupos de roles reutilizables para usar con @Roles().
 *
 * ROLES_CLINICOS — terapeutas + admin. Pueden registrar sesiones y acceder a datos clínicos.
 * ROLES_GESTION  — admin + recepción. Pueden ver cobros y gestión general del gabinete.
 */
export const ROLES_CLINICOS = ['ADMIN', 'PEDAGOGO', 'NEURO', 'LOGOPEDA'] as const;
export const ROLES_GESTION  = ['ADMIN', 'RECEP'] as const;
