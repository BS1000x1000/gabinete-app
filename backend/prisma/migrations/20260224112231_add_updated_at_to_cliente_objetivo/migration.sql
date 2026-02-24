/*
  Warnings:

  - Added the required column `fecha_actualizacion` to the `clientes_objetivos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "clientes_objetivos" ADD COLUMN     "fecha_actualizacion" TIMESTAMP(3) NOT NULL;
