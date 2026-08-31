import { IsArray, ArrayMinSize, ValidateNested, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSlotDto } from './create-slot.dto';

/**
 * Replanificación de un contrato: se le pasa el horario semanal NUEVO completo
 * (reemplaza al anterior) y recoloca en bloque las sesiones futuras.
 *
 * Resuelve el caso que obligaba a editar sesión por sesión: «este niño pasa de
 * los miércoles a los viernes a las 16:00».
 */
export class ReplanificarContratoDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSlotDto)
  slots: CreateSlotDto[];

  /**
   * Firma del plan previsualizado. Obligatoria al aplicar: si entre la vista
   * previa y la confirmación alguien completó o canceló una sesión, el plan ya
   * no es el que se vio y se rechaza en vez de aplicar algo distinto.
   */
  @IsOptional()
  @IsString()
  hashPrevisualizacion?: string;
}
