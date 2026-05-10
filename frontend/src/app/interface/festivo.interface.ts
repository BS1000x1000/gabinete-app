export type AmbitoFestivo = 'NACIONAL' | 'AUTONOMICO' | 'LOCAL';

export interface Festivo {
  id: string;
  fecha: string;
  descripcion: string;
  ambito: AmbitoFestivo;
  ccaa?: string | null;
  provincia?: string | null;
  anio: number;
}

export interface CreateFestivoPayload {
  fecha: string;
  descripcion: string;
  ambito: AmbitoFestivo;
  ccaa?: string;
  provincia?: string;
  anio: number;
}
