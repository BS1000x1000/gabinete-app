-- CreateEnum
CREATE TYPE "AmbitoFestivo" AS ENUM ('NACIONAL', 'AUTONOMICO', 'LOCAL');

-- CreateTable
CREATE TABLE "festivos" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "ambito" "AmbitoFestivo" NOT NULL,
    "ccaa" TEXT,
    "provincia" TEXT,
    "anio" INTEGER NOT NULL,

    CONSTRAINT "festivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periodos_vacaciones" (
    "id" TEXT NOT NULL,
    "id_trabajador" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "periodos_vacaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "festivos_anio_idx" ON "festivos"("anio");

-- CreateIndex
CREATE INDEX "festivos_fecha_idx" ON "festivos"("fecha");

-- CreateIndex
CREATE INDEX "periodos_vacaciones_id_trabajador_idx" ON "periodos_vacaciones"("id_trabajador");

-- AddForeignKey
ALTER TABLE "periodos_vacaciones" ADD CONSTRAINT "periodos_vacaciones_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "trabajadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
