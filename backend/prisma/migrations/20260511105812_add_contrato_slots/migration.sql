/*
  Warnings:

  - You are about to drop the column `dia_semana` on the `contratos_servicio` table. All the data in the column will be lost.
  - You are about to drop the column `duracion_minutos` on the `contratos_servicio` table. All the data in the column will be lost.
  - You are about to drop the column `hora_fin` on the `contratos_servicio` table. All the data in the column will be lost.
  - You are about to drop the column `hora_inicio` on the `contratos_servicio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contratos_servicio" DROP COLUMN "dia_semana",
DROP COLUMN "duracion_minutos",
DROP COLUMN "hora_fin",
DROP COLUMN "hora_inicio";

-- CreateTable
CREATE TABLE "contrato_slots" (
    "id" TEXT NOT NULL,
    "id_contrato" TEXT NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "duracion_minutos" INTEGER NOT NULL,
    "modalidad" "ModalidadSesion" NOT NULL DEFAULT 'PRESENCIAL',

    CONSTRAINT "contrato_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contrato_slots_id_contrato_idx" ON "contrato_slots"("id_contrato");

-- AddForeignKey
ALTER TABLE "contrato_slots" ADD CONSTRAINT "contrato_slots_id_contrato_fkey" FOREIGN KEY ("id_contrato") REFERENCES "contratos_servicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
