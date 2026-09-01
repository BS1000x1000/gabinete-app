-- AlterTable
ALTER TABLE "consentimientos_rgpd" ADD COLUMN     "autoriza_coordinacion_centro" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "autoriza_imagenes" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "autoriza_informes_terceros" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "consentimiento_menor_14" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fecha_firma" TIMESTAMP(3),
ADD COLUMN     "id_documento" TEXT,
ADD COLUMN     "motivo_registro_manual" TEXT,
ALTER COLUMN "texto_consentimiento" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "consentimientos_rgpd_id_documento_key" ON "consentimientos_rgpd"("id_documento");

-- CreateIndex
CREATE INDEX "consentimientos_rgpd_id_cliente_fecha_registro_idx" ON "consentimientos_rgpd"("id_cliente", "fecha_registro");

-- AddForeignKey
ALTER TABLE "consentimientos_rgpd" ADD CONSTRAINT "consentimientos_rgpd_id_documento_fkey" FOREIGN KEY ("id_documento") REFERENCES "documentos_cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

