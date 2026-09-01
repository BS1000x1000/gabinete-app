-- Un consentimiento lo pueden suscribir varios tutores legales.
--
-- Con dos titulares de la patria potestad lo normal es que firmen ambos, y el
-- documento que firma la familia tiene dos bloques de representante legal. Un
-- unico `id_familiar` no podia representar eso.
--
-- Orden deliberado: se crea la tabla y se traspasan los datos ANTES de tirar la
-- columna, para no perder quien firmo lo ya registrado.

-- CreateTable
CREATE TABLE "consentimiento_firmantes" (
    "id_consentimiento" TEXT NOT NULL,
    "id_familiar" TEXT NOT NULL,

    CONSTRAINT "consentimiento_firmantes_pkey" PRIMARY KEY ("id_consentimiento","id_familiar")
);

-- CreateIndex
CREATE INDEX "consentimiento_firmantes_id_familiar_idx" ON "consentimiento_firmantes"("id_familiar");

-- AddForeignKey
ALTER TABLE "consentimiento_firmantes" ADD CONSTRAINT "consentimiento_firmantes_id_consentimiento_fkey" FOREIGN KEY ("id_consentimiento") REFERENCES "consentimientos_rgpd"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consentimiento_firmantes" ADD CONSTRAINT "consentimiento_firmantes_id_familiar_fkey" FOREIGN KEY ("id_familiar") REFERENCES "familiares"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: el firmante unico de cada consentimiento pasa a ser su primer firmante.
INSERT INTO "consentimiento_firmantes" ("id_consentimiento", "id_familiar")
SELECT "id", "id_familiar" FROM "consentimientos_rgpd"
ON CONFLICT DO NOTHING;

-- DropForeignKey
ALTER TABLE "consentimientos_rgpd" DROP CONSTRAINT "consentimientos_rgpd_id_familiar_fkey";

-- AlterTable
ALTER TABLE "consentimientos_rgpd" DROP COLUMN "id_familiar";
