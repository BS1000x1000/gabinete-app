import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateVacacionesDto {
  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  motivo?: string;
}
