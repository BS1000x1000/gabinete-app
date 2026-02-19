import { IsInt, IsString, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class HorarioDto {
  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana: number; // 0=Domingo, 1=Lunes, ..., 6=Sábado

  @IsString()
  horaInicio: string; // Formato: "17:00"

  @IsString()
  horaFin: string; // Formato: "18:00"
}

export class CreateDisponibilidadDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HorarioDto)
  horarios: HorarioDto[];
}