-- El ambito se llama LOCAL, y lo local es del municipio, no de la provincia.
-- Con "provincia" era imposible distinguir Fuenlabrada de Alcorcon.
ALTER TABLE "festivos" RENAME COLUMN "provincia" TO "municipio";

-- Centinela '' en vez de NULL. En Postgres varios NULL conviven en un indice
-- unico, asi que con columnas nullable el UNIQUE de mas abajo no impediria el
-- duplicado que esta tabla lleva admitiendo desde que existe.
UPDATE "festivos" SET "ccaa" = '' WHERE "ccaa" IS NULL;
UPDATE "festivos" SET "municipio" = '' WHERE "municipio" IS NULL;

-- `ccaa` pasa a guardar el CODIGO de la comunidad, no su nombre escrito a mano.
-- Lo que no case se queda como esta: quedara visible en Configuracion para que
-- el ADMIN lo corrija, en vez de desaparecer en silencio.
UPDATE "festivos" SET "ccaa" = 'MAD'
  WHERE lower(trim("ccaa")) IN ('madrid', 'comunidad de madrid', 'c. madrid', 'com. madrid');

ALTER TABLE "festivos" ALTER COLUMN "ccaa" SET DEFAULT '';
ALTER TABLE "festivos" ALTER COLUMN "ccaa" SET NOT NULL;
ALTER TABLE "festivos" ALTER COLUMN "municipio" SET DEFAULT '';
ALTER TABLE "festivos" ALTER COLUMN "municipio" SET NOT NULL;

-- Normalizar la fecha a las 12:00 UTC. Hasta ahora convivian dos formas de
-- escribir el mismo dia natural: la importacion de nacionales guardaba el
-- mediodia local y el alta manual la medianoche UTC. Las dos leian el dia
-- correcto, pero son instantes distintos y el UNIQUE no las veria iguales.
UPDATE "festivos" SET "fecha" = date_trunc('day', "fecha") + interval '12 hours';

-- Limpiar los duplicados que la tabla admitia por no tener ninguna restriccion
-- unica, conservando uno de cada grupo. Sin esto el CREATE UNIQUE INDEX falla.
DELETE FROM "festivos" a
  USING "festivos" b
 WHERE a."fecha"     = b."fecha"
   AND a."ccaa"      = b."ccaa"
   AND a."municipio" = b."municipio"
   AND a."id"        > b."id";

-- CreateIndex
CREATE UNIQUE INDEX "festivos_fecha_ccaa_municipio_key" ON "festivos"("fecha", "ccaa", "municipio");

-- CreateTable
CREATE TABLE "configuracion_centro" (
    "id" TEXT NOT NULL DEFAULT 'centro',
    "ccaa_codigo" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_centro_pkey" PRIMARY KEY ("id")
);

-- Fila unica de arranque. El municipio va VACIO a proposito: los festivos
-- nacionales y autonomicos ya aplican -que es lo que promete el contrato-, y
-- los locales no se adivinan. Configuracion avisa hasta que el ADMIN elige.
INSERT INTO "configuracion_centro" ("id", "ccaa_codigo", "municipio", "provincia", "ultima_actualizacion")
VALUES ('centro', 'MAD', '', 'Madrid', CURRENT_TIMESTAMP);
