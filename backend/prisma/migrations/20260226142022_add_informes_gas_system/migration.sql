/*
  Warnings:

  - You are about to drop the column `fecha_registro` on the `informes` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_vencimiento` on the `informes` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoInforme" AS ENUM ('INICIAL', 'SEGUIMIENTO');

-- AlterTable
ALTER TABLE "clientes_objetivos" ADD COLUMN     "fecha_ultima_evaluacion" TIMESTAMP(3),
ADD COLUMN     "nivel_gas_actual" INTEGER;

-- AlterTable
ALTER TABLE "informes" DROP COLUMN "fecha_registro",
DROP COLUMN "fecha_vencimiento",
ADD COLUMN     "analisis_informacion" TEXT,
ADD COLUMN     "evaluacion_inicial" TEXT,
ADD COLUMN     "evolucion_observada" TEXT,
ADD COLUMN     "motivo_consulta" TEXT,
ADD COLUMN     "objetivos_generales_texto" TEXT,
ADD COLUMN     "objetivos_proximo_curso" TEXT,
ADD COLUMN     "objetivos_snapshot_json" TEXT,
ADD COLUMN     "periodo_desde" TIMESTAMP(3),
ADD COLUMN     "periodo_hasta" TIMESTAMP(3),
ADD COLUMN     "recomendaciones" TEXT,
ADD COLUMN     "tipo_informe" "TipoInforme" NOT NULL DEFAULT 'INICIAL',
ALTER COLUMN "contenido" DROP NOT NULL;

-- CreateTable
CREATE TABLE "descripcion_niveles_gas" (
    "id" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "id_cliente_objetivo" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "descripcion_niveles_gas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluaciones_gas" (
    "id" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL,
    "notas" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_cliente_objetivo" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluaciones_gas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "descripcion_niveles_gas_id_cliente_objetivo_nivel_key" ON "descripcion_niveles_gas"("id_cliente_objetivo", "nivel");

-- AddForeignKey
ALTER TABLE "descripcion_niveles_gas" ADD CONSTRAINT "descripcion_niveles_gas_id_cliente_objetivo_fkey" FOREIGN KEY ("id_cliente_objetivo") REFERENCES "clientes_objetivos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones_gas" ADD CONSTRAINT "evaluaciones_gas_id_cliente_objetivo_fkey" FOREIGN KEY ("id_cliente_objetivo") REFERENCES "clientes_objetivos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
