-- CreateEnum
CREATE TYPE "CategoriaDocumento" AS ENUM ('INFORME_MEDICO', 'INFORME_ESCOLAR', 'ADMINISTRATIVO', 'OTROS');

-- CreateTable
CREATE TABLE "documentos_cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" "CategoriaDocumento" NOT NULL,
    "storage_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "tamano_bytes" INTEGER NOT NULL,
    "fecha_documento" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,
    "id_cliente" TEXT NOT NULL,
    "id_subido_por" TEXT NOT NULL,

    CONSTRAINT "documentos_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "documentos_cliente_id_cliente_idx" ON "documentos_cliente"("id_cliente");

-- CreateIndex
CREATE INDEX "documentos_cliente_id_cliente_categoria_idx" ON "documentos_cliente"("id_cliente", "categoria");

-- CreateIndex
CREATE INDEX "documentos_cliente_fecha_creacion_idx" ON "documentos_cliente"("fecha_creacion");

-- AddForeignKey
ALTER TABLE "documentos_cliente" ADD CONSTRAINT "documentos_cliente_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_cliente" ADD CONSTRAINT "documentos_cliente_id_subido_por_fkey" FOREIGN KEY ("id_subido_por") REFERENCES "trabajadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
