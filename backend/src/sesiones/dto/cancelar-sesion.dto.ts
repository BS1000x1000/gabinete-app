import { IsBoolean, IsOptional } from 'class-validator';

export class CancelarSesionDto {
  @IsOptional()
  @IsBoolean()
  conAviso?: boolean; // true = CANCELADA_CON_AVISO, false = CANCELADA_SIN_AVISO
}