import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GenerarMesDto {
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2099)
  anio: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  mes: number;

  /**
   * Genera solo las del propio autonomo. Lo mandan las pantallas "Mis...";
   * un rol no ADMIN lo tiene forzado a true en el controlador, porque cada
   * circuito fiscal es independiente y nadie factura en nombre de otro.
   */
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  soloMias?: boolean;
}
