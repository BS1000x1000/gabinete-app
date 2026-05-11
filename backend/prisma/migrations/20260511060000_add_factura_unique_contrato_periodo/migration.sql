-- AddUniqueConstraint
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_id_contrato_periodo_facturado_key" UNIQUE ("id_contrato", "periodo_facturado");
