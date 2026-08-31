-- El contrato puede tener un PDF firmado subido que sustituye al generado.
--
-- Hasta ahora el PDF del contrato se generaba al vuelo con Puppeteer en cada
-- descarga y se descartaba: no habia forma de guardar el contrato firmado por
-- las partes. Estas columnas guardan la referencia al fichero en Object Storage
-- (el binario nunca vive en el contenedor, que es efimero).
--
-- `resumen_modificado_at` permite detectar que los datos con los que se factura
-- (cuota, vigencia, slots) se han tocado despues de subir el PDF firmado, para
-- avisar de que el papel y los datos ya no coinciden.
--
-- Migracion puramente aditiva: todas las columnas son nullable, ningun contrato
-- existente se ve afectado.
ALTER TABLE "contratos_servicio" ADD COLUMN     "fecha_subida_firmado" TIMESTAMP(3),
ADD COLUMN     "mime_type_firmado" TEXT,
ADD COLUMN     "resumen_modificado_at" TIMESTAMP(3),
ADD COLUMN     "storage_key_firmado" TEXT,
ADD COLUMN     "tamano_bytes_firmado" INTEGER;
