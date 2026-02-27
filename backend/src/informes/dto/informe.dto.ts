import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { TipoInforme, EstadoInforme } from '@prisma/client';

export class CreateInformeDto {
  @IsString()
  titulo: string;

  @IsEnum(TipoInforme)
  tipoInforme: TipoInforme;

  @IsUUID()
  clienteId: string;

  // Período evaluado (obligatorio para SEGUIMIENTO)
  @IsOptional()
  @IsDateString()
  periodoDesde?: string;

  @IsOptional()
  @IsDateString()
  periodoHasta?: string;

  // Sección 1 — Motivo de consulta
  @IsOptional()
  @IsString()
  motivoConsulta?: string;

  // Sección 2 — Análisis de información aportada
  @IsOptional()
  @IsString()
  analisisInformacion?: string;

  // Sección 3 — Evaluación inicial
  @IsOptional()
  @IsString()
  evaluacionInicial?: string;

  // Sección 4 — Objetivos generales (texto introductorio)
  @IsOptional()
  @IsString()
  objetivosGeneralesTexto?: string;

  // Solo para SEGUIMIENTO
  @IsOptional()
  @IsString()
  evolucionObservada?: string;

  @IsOptional()
  @IsString()
  objetivosProximoCurso?: string;

  @IsOptional()
  @IsString()
  recomendaciones?: string;
}

export class UpdateInformeDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsEnum(EstadoInforme)
  estado?: EstadoInforme;

  @IsOptional()
  @IsDateString()
  periodoDesde?: string;

  @IsOptional()
  @IsDateString()
  periodoHasta?: string;

  @IsOptional()
  @IsString()
  motivoConsulta?: string;

  @IsOptional()
  @IsString()
  analisisInformacion?: string;

  @IsOptional()
  @IsString()
  evaluacionInicial?: string;

  @IsOptional()
  @IsString()
  objetivosGeneralesTexto?: string;

  @IsOptional()
  @IsString()
  evolucionObservada?: string;

  @IsOptional()
  @IsString()
  objetivosProximoCurso?: string;

  @IsOptional()
  @IsString()
  recomendaciones?: string;

  @IsOptional()
  @IsString()
  urlDocumentoFinal?: string;
}