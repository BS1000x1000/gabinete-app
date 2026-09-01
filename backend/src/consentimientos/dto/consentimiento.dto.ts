import {
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
 * Lo que llega por multipart viaja como texto: "true" y "false" no son
 * booleanos hasta que alguien los convierte.
 */
const aBooleano = () =>
  Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1' || value === 'on') return true;
    if (value === 'false' || value === '0' || value === '' || value == null) {
      return false;
    }
    return value;
  });

/**
 * Datos que acompanan al PDF firmado del consentimiento de datos.
 *
 * Todos los campos son opcionales aqui porque el mismo endpoint recibe los tres
 * documentos del expediente y solo uno los necesita. Quien exige que esten es
 * `ExpedienteService.registrarFirmado`, que ya sabe de que categoria se trata.
 */
export class FirmaExpedienteDto {
  /** Tutor legal que firma. Debe ser un familiar del cliente con `esTutorLegal`. */
  @IsOptional()
  @IsUUID()
  familiarId?: string;

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
  @IsUUID()
  @IsNotEmpty({ message: 'Indica el tutor legal que firma el consentimiento' })
  declare familiarId: string;

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
