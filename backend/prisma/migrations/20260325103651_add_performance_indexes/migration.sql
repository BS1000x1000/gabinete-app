-- CreateIndex
CREATE INDEX "bonos_id_cliente_idx" ON "bonos"("id_cliente");

-- CreateIndex
CREATE INDEX "bonos_estado_idx" ON "bonos"("estado");

-- CreateIndex
CREATE INDEX "informes_id_cliente_idx" ON "informes"("id_cliente");

-- CreateIndex
CREATE INDEX "informes_id_trabajador_idx" ON "informes"("id_trabajador");

-- CreateIndex
CREATE INDEX "informes_fecha_creacion_idx" ON "informes"("fecha_creacion");

-- CreateIndex
CREATE INDEX "notificaciones_id_trabajador_idx" ON "notificaciones"("id_trabajador");

-- CreateIndex
CREATE INDEX "notificaciones_leida_idx" ON "notificaciones"("leida");

-- CreateIndex
CREATE INDEX "registros_diarios_id_cliente_idx" ON "registros_diarios"("id_cliente");

-- CreateIndex
CREATE INDEX "registros_diarios_id_trabajador_idx" ON "registros_diarios"("id_trabajador");

-- CreateIndex
CREATE INDEX "registros_diarios_fecha_registro_idx" ON "registros_diarios"("fecha_registro");

-- CreateIndex
CREATE INDEX "sesiones_id_cliente_idx" ON "sesiones"("id_cliente");

-- CreateIndex
CREATE INDEX "sesiones_id_trabajador_idx" ON "sesiones"("id_trabajador");

-- CreateIndex
CREATE INDEX "sesiones_fecha_hora_inicio_idx" ON "sesiones"("fecha_hora_inicio");

-- CreateIndex
CREATE INDEX "sesiones_id_trabajador_fecha_hora_inicio_idx" ON "sesiones"("id_trabajador", "fecha_hora_inicio");
