/**
 * Disponibilidad del terapeuta: las franjas en las que puede ofrecer hueco a
 * una familia. Aquí no hay jornadas contratadas —son autónomos—, así que lo
 * que se declara es cuándo se acepta cliente, no cuándo se ficha.
 *
 * El tipo conserva el nombre `HorarioLaboral` del modelo Prisma, que a su vez
 * lo conserva por historia; el porqué está en su doc-comment en
 * `schema.prisma`. En la UI se llama disponibilidad.
 *
 * Convive con `HorarioAdmin` sin solaparse: esto es el marco (cuándo hay
 * hueco) y los bloques de administración son la parte de ese marco que ya está
 * ocupada por trabajo no clínico. Juntos son "Mi semana".
 *
 * No bloquea nada: alimenta el aviso `FUERA_DE_DISPONIBILIDAD` al programar
 * una sesión. Sin franjas declaradas ese aviso no salta —sería ruido para
 * quien aún no las ha configurado—, que es la razón por la que llevaba sin
 * saltar nunca: el modelo existía en el backend y no había pantalla.
 */
export interface HorarioLaboral {
  id: string;
  trabajadorId: string;
  /** ISO: 1=Lunes .. 7=Domingo, igual que HorarioAdmin y ContratoSlot. */
  diaSemana: number;
  horaInicio: string; // "HH:mm"
  horaFin: string;
  activo: boolean;
}

export interface CreateHorarioLaboralDto {
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}

export interface UpdateHorarioLaboralDto {
  horaInicio?: string;
  horaFin?: string;
  activo?: boolean;
}
