/*
  Warnings:

  - You are about to drop the column `adaptaciones` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `alergias` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `apoyos` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `diagnostico` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `medicacion` on the `Cliente` table. All the data in the column will be lost.
  - You are about to drop the column `tratamientos` on the `Cliente` table. All the data in the column will be lost.
  - Added the required column `ciudad` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dni` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provincia` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dni_madre` to the `Familiar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dni_padre` to the `Familiar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre_madre` to the `Familiar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre_padre` to the `Familiar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "adaptaciones",
DROP COLUMN "alergias",
DROP COLUMN "apoyos",
DROP COLUMN "diagnostico",
DROP COLUMN "medicacion",
DROP COLUMN "tratamientos",
ADD COLUMN     "ciudad" TEXT NOT NULL,
ADD COLUMN     "dni" TEXT NOT NULL,
ADD COLUMN     "provincia" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Familiar" ADD COLUMN     "dni_madre" TEXT NOT NULL,
ADD COLUMN     "dni_padre" TEXT NOT NULL,
ADD COLUMN     "nombre_madre" TEXT NOT NULL,
ADD COLUMN     "nombre_padre" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Sanitario" (
    "id" TEXT NOT NULL,
    "diagnostico" TEXT NOT NULL,
    "tratamientos" TEXT NOT NULL,
    "medicacion" TEXT NOT NULL,
    "alergias" TEXT,
    "adaptaciones" BOOLEAN NOT NULL DEFAULT false,
    "especialistas" TEXT[],
    "apoyos" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,
    "id_cliente" TEXT NOT NULL,

    CONSTRAINT "Sanitario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sanitario_id_cliente_key" ON "Sanitario"("id_cliente");

-- AddForeignKey
ALTER TABLE "Sanitario" ADD CONSTRAINT "Sanitario_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
