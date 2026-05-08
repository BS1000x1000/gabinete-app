import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateHorarioAdminDto {
  @IsInt()
  @Min(1)
  @Max(7)
  diaSemana: number;

  @Matches(/^\d{2}:\d{2}$/)
  horaInicio: string;

  @Matches(/^\d{2}:\d{2}$/)
  horaFin: string;

  @IsString()
  @IsOptional()
  titulo?: string;
}
