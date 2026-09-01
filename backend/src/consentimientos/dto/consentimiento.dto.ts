import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * En multipart, un campo repetido llega como array y uno solo como string.
 * Aqui siempre es una lista: pueden firmar los dos tutores.
 */
const aLista = () =>
  Transform(({ value }: { value: unknown }): string[] => {
    if (Array.isArray(value)) {
      return value.filter(
        (v): v is string => typeof v === 'string' && v !== '',
      );
    }
    if (typeof value === 'string' && value !== '') return [value];
    return [];
  });

/**
 * Lo que llega por multipart viaja como texto: "true" y "false" no son
 * booleanos hasta que alguien los convierte.
 */
const aBooleano = () =>
  Transform(({ value }: { value: unknown }): boolean => {
    if (typeof value === 'boolean') return value;
    return value === 'true' || value === '1' || value === 'on';
  });

/**
 * Datos que acompanan al PDF firmado del consentimiento de datos.
 *
 * Todos los campos son opcionales aqui porque el mismo endpoint recibe los tres
 * documentos del expediente y solo uno los necesita. Quien exige que esten es
 * `ExpedienteService.registrarFirmado`, que ya sabe de que categoria se trata.
 */
export class FirmaExpedienteDto {
  /**
   * Tutores legales que firman. Con dos titulares de la patria potestad lo
   * normal es que firmen los dos; con uno solo, basta el suyo. Todos tienen que
   * ser familiares del cliente con `esTutorLegal`.
   */
  @IsOptional()
  @aLista()
  @IsArray()
  @ArrayNotEmpty({ message: 'Indica quien ha firmado el consentimiento' })
  @IsUUID('4', { each: true })
  firmanteIds?: string[];

  /** La fecha que la familia escribe en el papel, no la de subida. */
  @IsOptional()
  @IsDateString()
  fechaFirma?: string;

  /** Trabajar con informes medicos o psicologicos que aporta la familia. */
  @IsOptional()
  @aBooleano()
  @IsBoolean()
  autorizaInformesTerceros?: boolean;

  /** Intercambiar documentacion con el centro educativo u otros profesionales. */
  @IsOptional()
  @aBooleano()
  @IsBoolean()
  autorizaCoordinacionCentro?: boolean;

  /** Fotografias y grabaciones de sesion para registro interno. */
  @IsOptional()
  @aBooleano()
  @IsBoolean()
  autorizaImagenes?: boolean;

  /** El menor de 14 o mas anos firma tambien (LOPDGDD art. 7). */
  @IsOptional()
  @aBooleano()
  @IsBoolean()
  consentimientoMenor14?: boolean;
}

/**
 * Registro manual: el consentimiento se firmo fuera del circuito del
 * expediente (cartera anterior, papel entregado en mano).
 *
 * Exige el escaneado, que es lo que lo separa del checkbox ciego que este
 * flujo vino a sustituir: sin evidencia no se registra nada.
 */
export class RegistroManualConsentimientoDto extends FirmaExpedienteDto {
  @aLista()
  @IsArray()
  @ArrayNotEmpty({ message: 'Indica que tutor o tutores legales han firmado' })
  @IsUUID('4', { each: true })
  declare firmanteIds: string[];

  @IsString()
  @MinLength(10, {
    message:
      'Explica por que este consentimiento se registra fuera del expediente',
  })
  @MaxLength(1000)
  motivoRegistroManual: string;

  /**
   * Version del texto que firmo la familia. Si el papel es anterior a las
   * plantillas de la app, se anota tal cual ("papel externo 2024").
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  versionTexto: string;
}

/** Revocacion. El backend resuelve quien consintio: no se pide al navegador. */
export class RevocarConsentimientoDto {
  @IsString()
  @MinLength(5, { message: 'Indica el motivo de la revocacion' })
  @MaxLength(1000)
  motivo: string;
}
