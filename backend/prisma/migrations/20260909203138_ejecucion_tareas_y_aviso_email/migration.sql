-- CreateEnum
CREATE TYPE "EstadoEjecucion" AS ENUM ('EN_CURSO', 'OK', 'ERROR');

-- AlterEnum
ALTER TYPE "TipoNotificacion" ADD VALUE 'CLIENTE_SIN_EMAIL_FACTURACION';

-- CreateTable
CREATE TABLE "ejecuciones_tarea" (
    "id" TEXT NOT NULL,
    "tarea" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fin" TIMESTAMP(3),
    "estado" "EstadoEjecucion" NOT NULL DEFAULT 'EN_CURSO',
    "resumen" JSONB,
    "error" TEXT,

    CONSTRAINT "ejecuciones_tarea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ejecuciones_tarea_tarea_inicio_idx" ON "ejecuciones_tarea"("tarea", "inicio");
