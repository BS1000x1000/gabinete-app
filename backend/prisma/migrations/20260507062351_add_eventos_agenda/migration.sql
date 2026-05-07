-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('COORDINACION_EQUIPO', 'COORDINACION_COLEGIO', 'COORDINACION_PROFESIONAL', 'TIEMPO_ADMINISTRACION', 'FORMACION', 'OTRO');

-- CreateTable
CREATE TABLE "eventos_agenda" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_hora_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_hora_fin" TIMESTAMP(3) NOT NULL,
    "tipo" "TipoEvento" NOT NULL,
    "creado_por_id" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evento_participantes" (
    "evento_id" TEXT NOT NULL,
    "trabajador_id" TEXT NOT NULL,

    CONSTRAINT "evento_participantes_pkey" PRIMARY KEY ("evento_id","trabajador_id")
);

-- CreateIndex
CREATE INDEX "eventos_agenda_fecha_hora_inicio_idx" ON "eventos_agenda"("fecha_hora_inicio");

-- CreateIndex
CREATE INDEX "eventos_agenda_creado_por_id_idx" ON "eventos_agenda"("creado_por_id");

-- AddForeignKey
ALTER TABLE "eventos_agenda" ADD CONSTRAINT "eventos_agenda_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "trabajadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento_participantes" ADD CONSTRAINT "evento_participantes_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos_agenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento_participantes" ADD CONSTRAINT "evento_participantes_trabajador_id_fkey" FOREIGN KEY ("trabajador_id") REFERENCES "trabajadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
