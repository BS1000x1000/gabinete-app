/*
  Warnings:

  - A unique constraint covering the columns `[id_cliente]` on the table `Familiar` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Familiar_id_cliente_key" ON "Familiar"("id_cliente");
