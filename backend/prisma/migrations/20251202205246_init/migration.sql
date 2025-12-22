/*
  Warnings:

  - Added the required column `centro_salud` to the `Sanitario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sanitario" ADD COLUMN     "centro_salud" TEXT NOT NULL;
