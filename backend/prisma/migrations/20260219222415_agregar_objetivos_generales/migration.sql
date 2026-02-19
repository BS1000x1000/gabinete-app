-- CreateTable
CREATE TABLE "areas_desarrollo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "color" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_desarrollo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objetivos_generales" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,
    "id_area_desarrollo" TEXT NOT NULL,

    CONSTRAINT "objetivos_generales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes_objetivos" (
    "id" TEXT NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_cliente" TEXT NOT NULL,
    "id_objetivo_general" TEXT NOT NULL,

    CONSTRAINT "clientes_objetivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_diarios_objetivos" (
    "id" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_registro_diario" TEXT NOT NULL,
    "id_objetivo_general" TEXT NOT NULL,

    CONSTRAINT "registros_diarios_objetivos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "areas_desarrollo_nombre_key" ON "areas_desarrollo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_objetivos_id_cliente_id_objetivo_general_key" ON "clientes_objetivos"("id_cliente", "id_objetivo_general");

-- CreateIndex
CREATE UNIQUE INDEX "registros_diarios_objetivos_id_registro_diario_id_objetivo__key" ON "registros_diarios_objetivos"("id_registro_diario", "id_objetivo_general");

-- AddForeignKey
ALTER TABLE "objetivos_generales" ADD CONSTRAINT "objetivos_generales_id_area_desarrollo_fkey" FOREIGN KEY ("id_area_desarrollo") REFERENCES "areas_desarrollo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes_objetivos" ADD CONSTRAINT "clientes_objetivos_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes_objetivos" ADD CONSTRAINT "clientes_objetivos_id_objetivo_general_fkey" FOREIGN KEY ("id_objetivo_general") REFERENCES "objetivos_generales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_diarios_objetivos" ADD CONSTRAINT "registros_diarios_objetivos_id_registro_diario_fkey" FOREIGN KEY ("id_registro_diario") REFERENCES "registros_diarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_diarios_objetivos" ADD CONSTRAINT "registros_diarios_objetivos_id_objetivo_general_fkey" FOREIGN KEY ("id_objetivo_general") REFERENCES "objetivos_generales"("id") ON DELETE CASCADE ON UPDATE CASCADE;
