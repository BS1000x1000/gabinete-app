-- CreateEnum
CREATE TYPE "PeriodicidadEnvio" AS ENUM ('NINGUNA', 'MENSUAL', 'TRIMESTRAL');

-- CreateEnum
CREATE TYPE "EstadoEnvioGestoria" AS ENUM ('PENDIENTE', 'ENVIADO', 'ERROR');

-- AlterEnum
ALTER TYPE "TipoNotificacion" ADD VALUE 'FACTURAS_SIN_ENTREGAR';

-- AlterTable
ALTER TABLE "trabajadores" ADD COLUMN     "email_gestoria" TEXT,
ADD COLUMN     "nombre_gestoria" TEXT,
ADD COLUMN     "periodicidad_gestoria" "PeriodicidadEnvio" NOT NULL DEFAULT 'NINGUNA';

-- CreateTable
CREATE TABLE "envios_gestoria" (
    "id" TEXT NOT NULL,
    "id_trabajador" TEXT NOT NULL,
    "periodo_desde" TEXT NOT NULL,
    "periodo_hasta" TEXT NOT NULL,
    "email_destino" TEXT NOT NULL,
    "num_facturas" INTEGER NOT NULL,
    "total_importe" DECIMAL(10,2) NOT NULL,
    "storage_key" TEXT,
    "estado" "EstadoEnvioGestoria" NOT NULL DEFAULT 'PENDIENTE',
    "error" TEXT,
    "automatico" BOOLEAN NOT NULL DEFAULT false,
    "fecha_envio" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "envios_gestoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "envios_gestoria_facturas" (
    "id_envio" TEXT NOT NULL,
    "id_factura" TEXT NOT NULL,

    CONSTRAINT "envios_gestoria_facturas_pkey" PRIMARY KEY ("id_envio","id_factura")
);

-- CreateIndex
CREATE INDEX "envios_gestoria_id_trabajador_idx" ON "envios_gestoria"("id_trabajador");

-- CreateIndex
CREATE INDEX "envios_gestoria_estado_idx" ON "envios_gestoria"("estado");

-- CreateIndex
CREATE INDEX "envios_gestoria_facturas_id_factura_idx" ON "envios_gestoria_facturas"("id_factura");

-- AddForeignKey
ALTER TABLE "envios_gestoria" ADD CONSTRAINT "envios_gestoria_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "trabajadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios_gestoria_facturas" ADD CONSTRAINT "envios_gestoria_facturas_id_envio_fkey" FOREIGN KEY ("id_envio") REFERENCES "envios_gestoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios_gestoria_facturas" ADD CONSTRAINT "envios_gestoria_facturas_id_factura_fkey" FOREIGN KEY ("id_factura") REFERENCES "facturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
