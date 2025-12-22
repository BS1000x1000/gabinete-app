/*
  Warnings:

  - Added the required column `tipo_adaptaciones` to the `Sanitario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sanitario" ADD COLUMN     "tipo_adaptaciones" TEXT NOT NULL;
