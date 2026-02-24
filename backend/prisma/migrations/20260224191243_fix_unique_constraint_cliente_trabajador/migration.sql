/*
  Warnings:

  - A unique constraint covering the columns `[id_cliente,id_trabajador,tipo_terapia]` on the table `clientes_trabajadores` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "clientes_trabajadores_id_cliente_id_trabajador_key";

-- CreateIndex
CREATE UNIQUE INDEX "clientes_trabajadores_id_cliente_id_trabajador_tipo_terapia_key" ON "clientes_trabajadores"("id_cliente", "id_trabajador", "tipo_terapia");
