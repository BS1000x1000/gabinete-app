import { IsBoolean, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class UpdateHorarioAdminDto {
  @IsInt()
  @Min(1)
  @Max(7)
  @IsOptional()
  diaSemana?: number;

  @Matches(/^\d{2}:\d{2}$/)
  @IsOptional()
  horaInicio?: string;

  @Matches(/^\d{2}:\d{2}$/)
  @IsOptional()
  horaFin?: string;

  @IsString()
  @IsOptional()
  titulo?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
