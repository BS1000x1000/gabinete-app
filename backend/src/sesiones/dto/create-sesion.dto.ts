import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ModalidadSesion, TipoSesion } from '@prisma/client';

/**
 * Sesión suelta: una evaluación, una sesión extra que se cobra aparte, una
 * reunión con el colegio. No pertenece a ningún contrato y por tanto **ningún
 * proceso automático la mueve ni la cancela** — ni el recolocador del contrato
 * ni el cron de la ventana móvil.
 *
 * El horario recurrente de un cliente NO se crea por aquí: eso lo definen los
 * slots del contrato. Que una hora no esté en el contrato no impide crearla:
 * como mucho se devuelve un aviso.
 */
export class CreateSesionDto {
  @IsUUID('4')
  clienteId: string;

  @IsUUID('4')
  trabajadorId: string;

  @IsDateString()
  fechaHoraInicio: string;

  @IsDateString()
  fechaHoraFin: string;

  @IsEnum(TipoSesion)
  tipoSesion: TipoSesion;

  @IsOptional()
  @IsEnum(ModalidadSesion)
  modalidad?: ModalidadSesion;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notas?: string;
}
