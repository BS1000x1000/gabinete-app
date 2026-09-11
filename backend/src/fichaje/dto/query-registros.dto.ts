import { IsOptional, Matches } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

/**
 * Filtros de lectura de registros diarios de un cliente: paginacion + periodo.
 *
 * `desde` y `hasta` son **DIAS**, no instantes, y por eso se exige `YYYY-MM-DD`
 * pelado en vez de `@IsDateString()`: aceptar un ISO completo invitaria a mandar
 * `...T00:00:00.000Z`, que es la medianoche UTC y en Madrid ya es el dia
 * anterior. El rango se resuelve con `diaDesdeIso` (ver `common/fecha/dia.utils`)
 * y es **inclusivo por los dos extremos**: pedir 2026-10-01..2026-10-31 devuelve
 * los registros de los dos dias frontera.
 */
export class QueryRegistrosClienteDto extends PaginationDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'desde debe tener el formato YYYY-MM-DD',
  })
  desde?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'hasta debe tener el formato YYYY-MM-DD',
  })
  hasta?: string;
}
