/*
  Warnings:

  - You are about to drop the `Cliente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Colegio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Familiar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Horario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Informe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Objetivo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RegistroDiario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rol` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sanitario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Trabajador` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EstadoSesion" AS ENUM ('PROGRAMADA', 'COMPLETADA', 'CANCELADA_CON_AVISO', 'CANCELADA_SIN_AVISO', 'VACACIONES');

-- CreateEnum
CREATE TYPE "TipoSesion" AS ENUM ('PEDAGOGIA', 'NEUROPSICOLOGIA', 'EVALUACION', 'REUNION_COLEGIO');

-- CreateEnum
CREATE TYPE "EstadoInforme" AS ENUM ('BORRADOR', 'REVISION', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "EstadoObjetivo" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADO', 'CANCELADO');

-- DropForeignKey
ALTER TABLE "Cliente" DROP CONSTRAINT "Cliente_id_colegio_fkey";

-- DropForeignKey
ALTER TABLE "Familiar" DROP CONSTRAINT "Familiar_id_cliente_fkey";

-- DropForeignKey
ALTER TABLE "Horario" DROP CONSTRAINT "Horario_id_cliente_fkey";

-- DropForeignKey
ALTER TABLE "Horario" DROP CONSTRAINT "Horario_id_trabajador_fkey";

-- DropForeignKey
ALTER TABLE "Informe" DROP CONSTRAINT "Informe_id_cliente_fkey";

-- DropForeignKey
ALTER TABLE "Informe" DROP CONSTRAINT "Informe_id_trabajador_fkey";

-- DropForeignKey
ALTER TABLE "Objetivo" DROP CONSTRAINT "Objetivo_id_cliente_fkey";

-- DropForeignKey
ALTER TABLE "Objetivo" DROP CONSTRAINT "Objetivo_id_trabajador_responsable_fkey";

-- DropForeignKey
ALTER TABLE "RegistroDiario" DROP CONSTRAINT "RegistroDiario_id_cliente_fkey";

-- DropForeignKey
ALTER TABLE "RegistroDiario" DROP CONSTRAINT "RegistroDiario_id_trabajador_fkey";

-- DropForeignKey
ALTER TABLE "Sanitario" DROP CONSTRAINT "Sanitario_id_cliente_fkey";

-- DropForeignKey
ALTER TABLE "Trabajador" DROP CONSTRAINT "Trabajador_id_rol_fkey";

-- DropForeignKey
ALTER TABLE "clientes_trabajadores" DROP CONSTRAINT "clientes_trabajadores_id_cliente_fkey";

-- DropForeignKey
ALTER TABLE "clientes_trabajadores" DROP CONSTRAINT "clientes_trabajadores_id_trabajador_fkey";

-- DropTable
DROP TABLE "Cliente";

-- DropTable
DROP TABLE "Colegio";

-- DropTable
DROP TABLE "Familiar";

-- DropTable
DROP TABLE "Horario";

-- DropTable
DROP TABLE "Informe";

-- DropTable
DROP TABLE "Objetivo";

-- DropTable
DROP TABLE "RegistroDiario";

-- DropTable
DROP TABLE "Rol";

-- DropTable
DROP TABLE "Sanitario";

-- DropTable
DROP TABLE "Trabajador";

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "nombre_rol" TEXT NOT NULL,
    "codigo_rol" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trabajadores" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "url_imagen_perfil" TEXT,
    "fecha_contratacion" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,
    "id_rol" TEXT NOT NULL,

    CONSTRAINT "trabajadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colegios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion_colegio" TEXT NOT NULL,
    "nombre_primero" TEXT NOT NULL,
    "telefono_primero" TEXT NOT NULL,
    "email_primero" TEXT NOT NULL,
    "txt_primero" TEXT NOT NULL,
    "nombre_segundo" TEXT,
    "telefono_segundo" TEXT,
    "email_segundo" TEXT,
    "txt_segundo" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colegios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "id_carpeta_drive" TEXT,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3),
    "dni" TEXT NOT NULL,
    "domicilio" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "curso" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3),
    "fecha_alta" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,
    "id_colegio" TEXT,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilidad_clientes" (
    "id" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "id_cliente" TEXT NOT NULL,

    CONSTRAINT "disponibilidad_clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "id" TEXT NOT NULL,
    "fecha_hora_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_hora_fin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoSesion" NOT NULL DEFAULT 'PROGRAMADA',
    "tipoSesion" "TipoSesion" NOT NULL DEFAULT 'PEDAGOGIA',
    "notas" TEXT,
    "objetivosTrabajados" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,
    "id_cliente" TEXT NOT NULL,
    "id_trabajador" TEXT NOT NULL,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "familiares" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "dni" TEXT,
    "parentesco" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "es_responsable_pago" BOOLEAN NOT NULL DEFAULT false,
    "es_contacto_principal" BOOLEAN NOT NULL DEFAULT true,
    "whatsapp" BOOLEAN NOT NULL DEFAULT true,
    "id_cliente" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "familiares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "datos_sanitarios" (
    "id" TEXT NOT NULL,
    "diagnostico" TEXT NOT NULL,
    "centro_salud" TEXT NOT NULL,
    "tratamientos" TEXT NOT NULL,
    "medicacion" TEXT NOT NULL,
    "alergias" TEXT,
    "adaptaciones" BOOLEAN NOT NULL DEFAULT false,
    "tipo_adaptaciones" TEXT,
    "especialistas" TEXT[],
    "apoyos" BOOLEAN NOT NULL DEFAULT false,
    "id_cliente" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "datos_sanitarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "informes" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_vencimiento" TIMESTAMP(3),
    "estado" "EstadoInforme" NOT NULL DEFAULT 'BORRADOR',
    "url_documento_final" TEXT,
    "id_cliente" TEXT NOT NULL,
    "id_trabajador" TEXT NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "informes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_diarios" (
    "id" TEXT NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contenido" TEXT NOT NULL,
    "id_cliente" TEXT NOT NULL,
    "id_trabajador" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registros_diarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objetivos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin_prevista" TIMESTAMP(3),
    "estado" "EstadoObjetivo" NOT NULL DEFAULT 'PENDIENTE',
    "id_cliente" TEXT NOT NULL,
    "id_trabajador_responsable" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "objetivos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_rol_key" ON "roles"("nombre_rol");

-- CreateIndex
CREATE UNIQUE INDEX "roles_codigo_rol_key" ON "roles"("codigo_rol");

-- CreateIndex
CREATE UNIQUE INDEX "trabajadores_username_key" ON "trabajadores"("username");

-- CreateIndex
CREATE UNIQUE INDEX "trabajadores_email_key" ON "trabajadores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "colegios_nombre_key" ON "colegios"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_dni_key" ON "clientes"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "datos_sanitarios_id_cliente_key" ON "datos_sanitarios"("id_cliente");

-- AddForeignKey
ALTER TABLE "trabajadores" ADD CONSTRAINT "trabajadores_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_id_colegio_fkey" FOREIGN KEY ("id_colegio") REFERENCES "colegios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes_trabajadores" ADD CONSTRAINT "clientes_trabajadores_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes_trabajadores" ADD CONSTRAINT "clientes_trabajadores_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "trabajadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidad_clientes" ADD CONSTRAINT "disponibilidad_clientes_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "trabajadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "familiares" ADD CONSTRAINT "familiares_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "datos_sanitarios" ADD CONSTRAINT "datos_sanitarios_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "informes" ADD CONSTRAINT "informes_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "informes" ADD CONSTRAINT "informes_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "trabajadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_diarios" ADD CONSTRAINT "registros_diarios_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_diarios" ADD CONSTRAINT "registros_diarios_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "trabajadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objetivos" ADD CONSTRAINT "objetivos_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objetivos" ADD CONSTRAINT "objetivos_id_trabajador_responsable_fkey" FOREIGN KEY ("id_trabajador_responsable") REFERENCES "trabajadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
