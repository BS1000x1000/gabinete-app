import { IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

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
}
