-- AlterTable
ALTER TABLE "clientes_objetivos" ADD COLUMN     "notas" TEXT,
ADD COLUMN     "progreso" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ultima_vez_trabajado" TIMESTAMP(3),
ADD COLUMN     "veces_trabajado" INTEGER NOT NULL DEFAULT 0;
