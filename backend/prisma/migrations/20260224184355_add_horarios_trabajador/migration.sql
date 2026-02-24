/*
  Warnings:

  - The primary key for the `clientes_trabajadores` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id_cliente,id_trabajador]` on the table `clientes_trabajadores` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fecha_actualizacion` to the `clientes_trabajadores` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `clientes_trabajadores` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Made the column `tipo_terapia` on table `clientes_trabajadores` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "clientes_trabajadores" DROP CONSTRAINT "clientes_trabajadores_id_cliente_fkey";

-- DropForeignKey
ALTER TABLE "clientes_trabajadores" DROP CONSTRAINT "clientes_trabajadores_id_trabajador_fkey";

-- AlterTable
ALTER TABLE "clientes_trabajadores" DROP CONSTRAINT "clientes_trabajadores_pkey",
ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "tipo_terapia" SET NOT NULL,
ADD CONSTRAINT "clientes_trabajadores_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "disponibilidad_cliente_trabajador" (
    "id" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "id_cliente_trabajador" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disponibilidad_cliente_trabajador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_trabajadores_id_cliente_id_trabajador_key" ON "clientes_trabajadores"("id_cliente", "id_trabajador");

-- AddForeignKey
ALTER TABLE "clientes_trabajadores" ADD CONSTRAINT "clientes_trabajadores_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes_trabajadores" ADD CONSTRAINT "clientes_trabajadores_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "trabajadores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidad_cliente_trabajador" ADD CONSTRAINT "disponibilidad_cliente_trabajador_id_cliente_trabajador_fkey" FOREIGN KEY ("id_cliente_trabajador") REFERENCES "clientes_trabajadores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
