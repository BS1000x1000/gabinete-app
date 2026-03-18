import { IsString, IsNotEmpty } from 'class-validator';

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
}
