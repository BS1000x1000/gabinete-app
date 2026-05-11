-- CreateEnum
CREATE TYPE "EstadoFactura" AS ENUM ('PENDIENTE', 'PAGADA', 'ANULADA');

-- CreateTable
CREATE TABLE "facturas" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "numero_formateado" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "id_trabajador" TEXT NOT NULL,
    "id_cliente" TEXT NOT NULL,
    "id_contrato" TEXT,
    "fecha_emision" TIMESTAMP(3) NOT NULL,
    "periodo_facturado" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "importe" DECIMAL(10,2) NOT NULL,
    "iva_porcentaje" DECIMAL(4,2) NOT NULL DEFAULT 0,
    "iva_importe" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "retencion_porcentaje" DECIMAL(4,2) NOT NULL DEFAULT 0,
    "retencion_importe" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "exencion_iva_texto" TEXT,
    "total" DECIMAL(10,2) NOT NULL,
    "estado" "EstadoFactura" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_pago" TIMESTAMP(3),
    "metodo_pago" TEXT,
    "url_pdf_r2" TEXT,
    "email_enviado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_envio_email" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contador_facturas" (
    "id_trabajador" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "ultimo_numero" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "contador_facturas_pkey" PRIMARY KEY ("id_trabajador","anio")
);

-- CreateIndex
CREATE INDEX "facturas_id_trabajador_anio_idx" ON "facturas"("id_trabajador", "anio");

-- CreateIndex
CREATE INDEX "facturas_id_cliente_idx" ON "facturas"("id_cliente");

-- CreateIndex
CREATE INDEX "facturas_estado_idx" ON "facturas"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_id_trabajador_anio_numero_key" ON "facturas"("id_trabajador", "anio", "numero");

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "trabajadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_id_contrato_fkey" FOREIGN KEY ("id_contrato") REFERENCES "contratos_servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contador_facturas" ADD CONSTRAINT "contador_facturas_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "trabajadores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
