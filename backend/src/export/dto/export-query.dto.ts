import { IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum ExportFormato {
  PDF = 'pdf',
  EXCEL = 'excel',
}

export class ExportQueryDto {
  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;

  @IsOptional()
  @IsEnum(ExportFormato)
  formato?: ExportFormato = ExportFormato.PDF;
}
