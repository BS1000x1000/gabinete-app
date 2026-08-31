-- Separa la situación escolar del niño de sus datos sanitarios.
--
-- Motivo: `adaptaciones`, `apoyos` y los especialistas del centro (PT, AL...) son
-- datos DEL ALUMNO, no del colegio ni de su historia clínica. Vivían en
-- `datos_sanitarios`; pasan a `datos_escolares` (1:1 con cliente).
--
-- Además se eliminan `medicacion` y `alergias` (minimización RGPD Art. 9: no se
-- usan en ningún flujo clínico de la app) y se relajan a NULL los campos
-- sanitarios, porque el paso del alta es opcional y a menudo aún no hay diagnóstico.
--
-- ORDEN IMPORTANTE: crear y poblar `datos_escolares` ANTES de soltar las columnas.

-- 1. Nueva tabla ------------------------------------------------------------
CREATE TABLE "datos_escolares" (
    "id" TEXT NOT NULL,
    "adaptaciones" BOOLEAN NOT NULL DEFAULT false,
    "tipo_adaptaciones" TEXT,
    "apoyos" BOOLEAN NOT NULL DEFAULT false,
    "especialistas" TEXT[],
    "id_cliente" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "datos_escolares_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "datos_escolares_id_cliente_key" ON "datos_escolares"("id_cliente");

ALTER TABLE "datos_escolares" ADD CONSTRAINT "datos_escolares_id_cliente_fkey"
    FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 2. Traspaso de datos ------------------------------------------------------
-- Solo se crea fila escolar para quien tenga algo que conservar; no se generan
-- filas vacías. `especialistas` NO se copia: los existentes se registraron en el
-- bloque sanitario y se interpretan como profesionales externos, que es donde
-- siguen viviendo.
INSERT INTO "datos_escolares" (
    "id", "adaptaciones", "tipo_adaptaciones", "apoyos", "especialistas",
    "id_cliente", "fecha_creacion", "ultima_actualizacion"
)
SELECT
    gen_random_uuid()::text,
    s."adaptaciones",
    s."tipo_adaptaciones",
    s."apoyos",
    ARRAY[]::TEXT[],
    s."id_cliente",
    s."fecha_creacion",
    CURRENT_TIMESTAMP
FROM "datos_sanitarios" s
WHERE s."adaptaciones" IS TRUE
   OR s."apoyos" IS TRUE
   OR (s."tipo_adaptaciones" IS NOT NULL AND s."tipo_adaptaciones" <> '');

-- 3. Limpieza de datos_sanitarios -------------------------------------------
ALTER TABLE "datos_sanitarios" DROP COLUMN "adaptaciones",
DROP COLUMN "alergias",
DROP COLUMN "apoyos",
DROP COLUMN "medicacion",
DROP COLUMN "tipo_adaptaciones",
ALTER COLUMN "diagnostico" DROP NOT NULL,
ALTER COLUMN "centro_salud" DROP NOT NULL,
ALTER COLUMN "tratamientos" DROP NOT NULL;
