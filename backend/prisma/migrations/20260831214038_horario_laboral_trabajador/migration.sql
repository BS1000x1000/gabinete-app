-- Jornada laboral declarada del terapeuta.
--
-- Hasta ahora no existia en ningun sitio: no habia forma de decir 'Belen trabaja
-- lunes, miercoles y viernes'. Por eso ningun formulario podia avisar de que se
-- estaba programando una sesion fuera de su jornada.
--
-- Es informativa: NUNCA bloquea. Siendo los terapeutas autonomos, su horario es
-- suyo; la app lo usa para avisar de despistes, no para imponer una jornada.
-- Migracion aditiva.
-- CreateTable
CREATE TABLE "horarios_laborales" (
    "id" TEXT NOT NULL,
    "id_trabajador" TEXT NOT NULL,
    "dia_semana" INTEGER NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "horarios_laborales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "horarios_laborales_id_trabajador_dia_semana_idx" ON "horarios_laborales"("id_trabajador", "dia_semana");

-- AddForeignKey
ALTER TABLE "horarios_laborales" ADD CONSTRAINT "horarios_laborales_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "trabajadores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

