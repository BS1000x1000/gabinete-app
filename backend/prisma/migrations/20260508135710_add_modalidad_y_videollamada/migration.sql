-- CreateEnum
CREATE TYPE "ModalidadSesion" AS ENUM ('PRESENCIAL', 'ONLINE');

-- CreateEnum
CREATE TYPE "ModalidadEvento" AS ENUM ('PRESENCIAL', 'ONLINE');

-- AlterTable
ALTER TABLE "eventos_agenda" ADD COLUMN     "modalidad" "ModalidadEvento" NOT NULL DEFAULT 'PRESENCIAL';

-- AlterTable
ALTER TABLE "sesiones" ADD COLUMN     "modalidad" "ModalidadSesion" NOT NULL DEFAULT 'PRESENCIAL';

-- AlterTable
ALTER TABLE "trabajadores" ADD COLUMN     "url_videollamada" TEXT;
