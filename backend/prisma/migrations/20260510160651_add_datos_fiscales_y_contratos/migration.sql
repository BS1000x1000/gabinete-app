-- CreateEnum
CREATE TYPE "EstadoContrato" AS ENUM ('BORRADOR', 'ACTIVO', 'SUSPENDIDO', 'FINALIZADO');

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "ciudad_tutor" TEXT,
ADD COLUMN     "codigo_postal_tutor" TEXT,
ADD COLUMN     "direccion_fiscal_tutor" TEXT,
ADD COLUMN     "email_facturacion_cliente" TEXT,
ADD COLUMN     "nif_tutor_pagador" TEXT,
ADD COLUMN     "nombre_tutor_pagador" TEXT;

-- AlterTable
ALTER TABLE "sesiones" ADD COLUMN     "id_contrato" TEXT;

-- AlterTable
ALTER TABLE "trabajadores" ADD COLUMN     "ciudad_fiscal" TEXT,
ADD COLUMN     "codigo_postal_fiscal" TEXT,
ADD COLUMN     "direccion_fiscal" TEXT,
ADD COLUMN     "email_facturacion" TEXT,
ADD COLUMN     "iban" TEXT,
ADD COLUMN     "nif_fiscal" TEXT,
ADD COLUMN     "nombre_fiscal" TEXT,
ADD COLUMN     "provincia_fiscal" TEXT,
ADD COLUMN     "retencion_irpf" DECIMAL(4,2);

-- CreateTable
CREATE TABLE "contratos_servicio" (
    "id" TEXT NOT NULL,
    "id_cliente" TEXT NOT NULL,
    "id_trabajador" TEXT NOT NULL,
    "tipoSesion" "TipoSesion" NOT NULL,
    "cuota_mensual" DECIMAL(10,2) NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "duracion_minutos" INTEGER NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3),
    "estado" "EstadoContrato" NOT NULL DEFAULT 'ACTIVO',
    "notas" TEXT,
    "fecha_firma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contratos_servicio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contratos_servicio_id_cliente_idx" ON "contratos_servicio"("id_cliente");

-- CreateIndex
CREATE INDEX "contratos_servicio_id_trabajador_idx" ON "contratos_servicio"("id_trabajador");

-- CreateIndex
CREATE INDEX "contratos_servicio_estado_idx" ON "contratos_servicio"("estado");

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_id_contrato_fkey" FOREIGN KEY ("id_contrato") REFERENCES "contratos_servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos_servicio" ADD CONSTRAINT "contratos_servicio_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos_servicio" ADD CONSTRAINT "contratos_servicio_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "trabajadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
