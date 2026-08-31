import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { CategoriaDocumento } from '@prisma/client';

/**
 * Metadatos que acompañan al fichero en la subida multipart.
 * El fichero en sí llega por `@UploadedFile()`, no por el body.
 */
export class CreateDocumentoDto {
  @IsUUID()
  clienteId: string;

  @IsEnum(CategoriaDocumento, {
    message: `categoria debe ser uno de: ${Object.values(CategoriaDocumento).join(', ')}`,
  })
  categoria: CategoriaDocumento;

  /** Nombre visible. Si no se envía, se usa el nombre original del fichero. */
  @IsOptional()
  @IsString()
  @MaxLength(180)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descripcion?: string;

  /** Fecha del documento en sí (no la de subida). ISO-8601. */
  @IsOptional()
  @IsDateString()
  fechaDocumento?: string;
}

export class UpdateDocumentoDto {
  @IsOptional()
  @IsEnum(CategoriaDocumento)
  categoria?: CategoriaDocumento;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fechaDocumento?: string;
}

/** Fichero en memoria entregado por multer. Tipado local para no depender de @types/multer. */
export interface FicheroSubido {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
