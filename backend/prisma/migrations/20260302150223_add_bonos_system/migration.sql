-- CreateEnum
CREATE TYPE "EstadoBono" AS ENUM ('ACTIVO', 'CONSUMIDO', 'CANCELADO');

-- AlterTable
ALTER TABLE "sesiones" ADD COLUMN     "id_bono" TEXT;

-- CreateTable
CREATE TABLE "bonos" (
    "id" TEXT NOT NULL,
    "total_sesiones" INTEGER NOT NULL,
    "sesiones_consumidas" INTEGER NOT NULL DEFAULT 0,
    "precio" DECIMAL(10,2) NOT NULL,
    "estado" "EstadoBono" NOT NULL DEFAULT 'ACTIVO',
    "pagado" BOOLEAN NOT NULL DEFAULT false,
    "metodo_pago" TEXT,
    "fecha_pago" TIMESTAMP(3),
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(3),
    "notas" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,
    "id_cliente" TEXT NOT NULL,
    "id_familiar_pago" TEXT,

    CONSTRAINT "bonos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_id_bono_fkey" FOREIGN KEY ("id_bono") REFERENCES "bonos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonos" ADD CONSTRAINT "bonos_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonos" ADD CONSTRAINT "bonos_id_familiar_pago_fkey" FOREIGN KEY ("id_familiar_pago") REFERENCES "familiares"("id") ON DELETE SET NULL ON UPDATE CASCADE;
