import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class GenerarPdfInformeDto {
  @IsString()
  @IsNotEmpty()
  htmlContenido: string;

  @IsString()
  @IsNotEmpty()
  clienteNombre: string;

  @IsString()
  @IsNotEmpty()
  clienteApellidos: string;

  @IsString()
  @IsNotEmpty()
  desde: string;

  @IsString()
  @IsNotEmpty()
  hasta: string;

  /** Título que aparece en la cabecera del PDF. Defecto: "Informe de Sesiones" */
  @IsString()
  @IsOptional()
  tituloPdf?: string;
}
