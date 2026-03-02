import { IsString, IsIn, IsOptional, IsDateString } from 'class-validator';

export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'BIZUM' | 'TARJETA';

export class RegistrarPagoDto {
  @IsString()
  @IsIn(['EFECTIVO', 'TRANSFERENCIA', 'BIZUM', 'TARJETA'])
  metodoPago: MetodoPago;

  @IsOptional()
  @IsDateString()
  fechaPago?: string;
}