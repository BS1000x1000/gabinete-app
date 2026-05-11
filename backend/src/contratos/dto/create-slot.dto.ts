import { IsEnum, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
import { ModalidadSesion } from '@prisma/client';

export class CreateSlotDto {
  @IsInt()
  @Min(1)
  @Max(7)
  diaSemana: number;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'horaInicio debe tener formato HH:mm' })
  horaInicio: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'horaFin debe tener formato HH:mm' })
  horaFin: string;

  @IsInt()
  @Min(15)
  @Max(240)
  duracionMinutos: number;

  @IsOptional()
  @IsEnum(ModalidadSesion)
  modalidad?: ModalidadSesion;
}
