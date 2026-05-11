import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class MarcarPagadaDto {
  @IsDateString()
  fechaPago: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  metodoPago?: string;
}
