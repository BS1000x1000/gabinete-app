-- AlterTable
ALTER TABLE "eventos_agenda" ADD COLUMN     "horario_admin_id" TEXT;

-- CreateTable
CREATE TABLE "horarios_admin" (
    "id" TEXT NOT NULL,
    "trabajador_id" TEXT NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "titulo" TEXT NOT NULL DEFAULT 'Tiempo de Administración',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "horarios_admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "horarios_admin_trabajador_id_idx" ON "horarios_admin"("trabajador_id");

-- AddForeignKey
ALTER TABLE "eventos_agenda" ADD CONSTRAINT "eventos_agenda_horario_admin_id_fkey" FOREIGN KEY ("horario_admin_id") REFERENCES "horarios_admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_admin" ADD CONSTRAINT "horarios_admin_trabajador_id_fkey" FOREIGN KEY ("trabajador_id") REFERENCES "trabajadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
