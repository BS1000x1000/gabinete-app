-- AlterEnum
ALTER TYPE "EstadoInforme" ADD VALUE 'ENVIADO';

-- AlterEnum
ALTER TYPE "TipoInforme" ADD VALUE 'REGISTROS';

-- AlterTable
ALTER TABLE "informes" ADD COLUMN     "enviado_familia_at" TIMESTAMP(3);
