-- CreateEnum
CREATE TYPE "OrigenDocumento" AS ENUM ('GENERADO', 'SUBIDO');

-- CreateEnum
CREATE TYPE "EstadoFirmaDocumento" AS ENUM ('GENERADO', 'ENVIADO', 'FIRMADO');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CategoriaDocumento" ADD VALUE 'CONTRATO';
ALTER TYPE "CategoriaDocumento" ADD VALUE 'CONSENTIMIENTO_INFORMADO';
ALTER TYPE "CategoriaDocumento" ADD VALUE 'CONSENTIMIENTO_DATOS';

-- AlterTable
ALTER TABLE "documentos_cliente" ADD COLUMN     "estado_firma" "EstadoFirmaDocumento",
ADD COLUMN     "fecha_envio" TIMESTAMP(3),
ADD COLUMN     "id_contrato" TEXT,
ADD COLUMN     "id_firmado_de" TEXT,
ADD COLUMN     "origen" "OrigenDocumento" NOT NULL DEFAULT 'SUBIDO',
ADD COLUMN     "plantilla_version" TEXT;

-- AlterTable
ALTER TABLE "familiares" ADD COLUMN     "es_tutor_legal" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "trabajadores" ADD COLUMN     "colegio_profesional" TEXT,
ADD COLUMN     "direccion_profesional" TEXT,
ADD COLUMN     "numero_poliza" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "documentos_cliente_id_firmado_de_key" ON "documentos_cliente"("id_firmado_de");

-- AddForeignKey
ALTER TABLE "documentos_cliente" ADD CONSTRAINT "documentos_cliente_id_contrato_fkey" FOREIGN KEY ("id_contrato") REFERENCES "contratos_servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_cliente" ADD CONSTRAINT "documentos_cliente_id_firmado_de_fkey" FOREIGN KEY ("id_firmado_de") REFERENCES "documentos_cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

