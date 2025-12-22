/*
  Warnings:

  - Added the required column `nombre_primero` to the `Colegio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefono_primero` to the `Colegio` table without a default value. This is not possible if the table is not empty.
  - Made the column `email_primero` on table `Colegio` required. This step will fail if there are existing NULL values in that column.
  - Made the column `txt_primero` on table `Colegio` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Colegio" ADD COLUMN     "nombre_primero" TEXT NOT NULL,
ADD COLUMN     "nombre_segundo" TEXT,
ADD COLUMN     "telefono_primero" TEXT NOT NULL,
ADD COLUMN     "telefono_segundo" TEXT,
ALTER COLUMN "email_primero" SET NOT NULL,
ALTER COLUMN "txt_primero" SET NOT NULL;
