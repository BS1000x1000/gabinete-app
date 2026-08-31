import { IsBoolean, IsInt, IsOptional, Matches, Max, Min } from 'class-validator';

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateHorarioLaboralDto {
  /** ISO: 1=Lunes .. 7=Domingo, igual que ContratoSlot y HorarioAdmin. */
  @IsInt()
  @Min(1)
  @Max(7)
  diaSemana: number;

  @Matches(HORA, { message: 'horaInicio debe tener formato HH:mm' })
  horaInicio: string;

  @Matches(HORA, { message: 'horaFin debe tener formato HH:mm' })
  horaFin: string;
}

export class UpdateHorarioLaboralDto {
  @IsOptional()
  @Matches(HORA, { message: 'horaInicio debe tener formato HH:mm' })
  horaInicio?: string;

  @IsOptional()
  @Matches(HORA, { message: 'horaFin debe tener formato HH:mm' })
  horaFin?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
