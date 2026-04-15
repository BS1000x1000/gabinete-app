-- CreateTable
CREATE TABLE "consentimientos_rgpd" (
    "id" TEXT NOT NULL,
    "aceptado" BOOLEAN NOT NULL,
    "version_texto" TEXT NOT NULL,
    "texto_consentimiento" TEXT NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_registro" TEXT,
    "id_cliente" TEXT NOT NULL,
    "id_familiar" TEXT NOT NULL,
    "id_trabajador" TEXT NOT NULL,

    CONSTRAINT "consentimientos_rgpd_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consentimientos_rgpd_id_cliente_idx" ON "consentimientos_rgpd"("id_cliente");

-- AddForeignKey
ALTER TABLE "consentimientos_rgpd" ADD CONSTRAINT "consentimientos_rgpd_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consentimientos_rgpd" ADD CONSTRAINT "consentimientos_rgpd_id_familiar_fkey" FOREIGN KEY ("id_familiar") REFERENCES "familiares"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consentimientos_rgpd" ADD CONSTRAINT "consentimientos_rgpd_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "trabajadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
