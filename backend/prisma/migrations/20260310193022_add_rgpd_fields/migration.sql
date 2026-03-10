-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "consentimiento_fecha" TIMESTAMP(3),
ADD COLUMN     "consentimiento_rgpd" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "trabajadores" ADD COLUMN     "especialidad" TEXT,
ADD COLUMN     "numero_colegiado" TEXT;
