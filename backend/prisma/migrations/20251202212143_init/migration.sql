/*
  Warnings:

  - You are about to drop the column `fecha_inicio` on the `Trabajador` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "fecha_inicio" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Trabajador" DROP COLUMN "fecha_inicio";
