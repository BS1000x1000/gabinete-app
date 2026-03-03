-- Migrate existing Spanish label strings to TipoSesion enum values
UPDATE "clientes_trabajadores" SET "tipo_terapia" = 'PEDAGOGIA'           WHERE "tipo_terapia" = 'Pedagogía';
UPDATE "clientes_trabajadores" SET "tipo_terapia" = 'NEUROPSICOLOGIA'     WHERE "tipo_terapia" = 'Neuropsicología';
UPDATE "clientes_trabajadores" SET "tipo_terapia" = 'LOGOPEDIA'           WHERE "tipo_terapia" = 'Logopedia';
UPDATE "clientes_trabajadores" SET "tipo_terapia" = 'TERAPIA_OCUPACIONAL' WHERE "tipo_terapia" = 'Terapia Ocupacional';
UPDATE "clientes_trabajadores" SET "tipo_terapia" = 'EVALUACION'          WHERE "tipo_terapia" = 'Evaluación';
UPDATE "clientes_trabajadores" SET "tipo_terapia" = 'REUNION_COLEGIO'     WHERE "tipo_terapia" = 'Reunión Colegio';

-- Change column type from TEXT to TipoSesion enum
ALTER TABLE "clientes_trabajadores"
  ALTER COLUMN "tipo_terapia" TYPE "TipoSesion"
  USING "tipo_terapia"::"TipoSesion";
