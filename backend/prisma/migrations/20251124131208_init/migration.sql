/*
  Warnings:

  - You are about to drop the column `email_orientador` on the `Colegio` table. All the data in the column will be lost.
  - You are about to drop the column `email_tutor` on the `Colegio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Colegio" DROP COLUMN "email_orientador",
DROP COLUMN "email_tutor",
ADD COLUMN     "email_primero" TEXT,
ADD COLUMN     "email_segundo" TEXT,
ADD COLUMN     "txt_primero" TEXT,
ADD COLUMN     "txt_segundo" TEXT;
