export type AmbitoFestivo = 'NACIONAL' | 'AUTONOMICO' | 'LOCAL';

export interface Festivo {
  id: string;
  fecha: string;
  descripcion: string;
  ambito: AmbitoFestivo;
  /** Código de comunidad ("MAD"), no nombre. Cadena vacía si es nacional. */
  ccaa: string;
  /** Municipio, solo si el ámbito es LOCAL. Cadena vacía en otro caso. */
  municipio: string;
  anio: number;
}

export interface CreateFestivoPayload {
  fecha: string;
  descripcion: string;
  ambito: AmbitoFestivo;
  ccaa?: string;
  municipio?: string;
}

export type UpdateFestivoPayload = Partial<CreateFestivoPayload>;

/**
 * El calendario que rige el centro. Es lo único que decide qué días cierra:
 * los festivos ya no se resuelven por la provincia del cliente, porque un
 * festivo local cierra el local, no cierra a la familia.
 */
export interface ConfiguracionCentro {
  id: string;
  ccaaCodigo: string;
  /** Vacío = sin festivos locales configurados. */
  municipio: string;
  provincia: string;
}

export interface OpcionCcaa {
  codigo: string;
  nombre: string;
}

export interface OpcionMunicipio {
  nombre: string;
  ccaa: string;
  provincia: string;
  /** Declarado en el catálogo pero todavía sin festivos cargados. */
  sinDatos: boolean;
}

/** Listas cerradas que alimentan los desplegables. No hay texto libre. */
export interface CatalogoFestivos {
  ccaa: OpcionCcaa[];
  municipios: OpcionMunicipio[];
}

export interface ResultadoImportacion {
  importados: number;
  omitidos: number;
  /** Municipios sin festivos en el catálogo — el calendario queda incompleto. */
  sinDatos: string[];
  /** El año no lo ha revisado nadie contra el BOCM ni los bandos municipales. */
  sinVerificar: boolean;
}

/**
 * Lo mínimo que necesita quien solo pregunta "¿qué días cierra el centro?":
 * la agenda y el selector de vacaciones. `GET /festivos/del-centro` no devuelve
 * más porque no hace falta más.
 */
export interface FestivoDelCentro {
  fecha: string;
  descripcion: string;
}

/** Un festivo tal como saldría de la importación, antes de escribir nada. */
export interface FestivoPrevisto {
  fecha: string;
  descripcion: string;
  ambito: AmbitoFestivo;
  ccaa: string;
  municipio: string;
  anio: number;
}
