-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('INFORME_INICIAL_PENDIENTE', 'INFORME_SEGUIMIENTO_PENDIENTE', 'BONO_AGOTADO', 'BONO_CASI_AGOTADO', 'BONO_PENDIENTE_PAGO', 'SIN_SESIONES_RECIENTES', 'OBJETIVO_SIN_EVALUAR', 'INFORME_EN_BORRADOR', 'SESION_SIN_BONO');

-- CreateEnum
CREATE TYPE "PrioridadNotif" AS ENUM ('URGENTE', 'ALTA', 'MEDIA', 'BAJA');

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "prioridad" "PrioridadNotif" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "descartada" BOOLEAN NOT NULL DEFAULT false,
    "accionUrl" TEXT,
    "regla_origen" TEXT NOT NULL,
    "referencia_id" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_lectura" TIMESTAMP(3),
    "id_trabajador" TEXT NOT NULL,
    "id_cliente" TEXT,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "trabajadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
