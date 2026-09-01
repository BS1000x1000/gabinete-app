import { IsArray, IsIn, IsOptional, IsUUID, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

/** Un periodo facturado: "2026-09". */
const PERIODO = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Que facturas entran en un paquete. O un rango de periodos, o una lista
 * explicita marcada en la tabla; la lista manda sobre el rango.
 */
export class PackFacturasDto {
  @IsOptional()
  @Matches(PERIODO, { message: 'periodoDesde debe tener el formato AAAA-MM' })
  periodoDesde?: string;

  @IsOptional()
  @Matches(PERIODO, { message: 'periodoHasta debe tener el formato AAAA-MM' })
  periodoHasta?: string;

  /**
   * Llega como campo repetido (`?ids=a&ids=b`) o como uno solo; un valor unico
   * llegaria como string y romperia el `IsArray`.
   */
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : [].concat(value)))
  @IsArray()
  @IsUUID('4', { each: true })
  ids?: string[];

  /** `zip` trae el libro y los PDF; `excel` solo el libro. */
  @IsOptional()
  @IsIn(['zip', 'excel'])
  formato?: 'zip' | 'excel';
}
