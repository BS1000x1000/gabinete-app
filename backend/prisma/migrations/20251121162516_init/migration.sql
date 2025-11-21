-- CreateTable
CREATE TABLE "Rol" (
    "id" TEXT NOT NULL,
    "nombre_rol" TEXT NOT NULL,
    "codigo_rol" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trabajador" (
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

    CONSTRAINT "Trabajador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Colegio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion_colegio" TEXT NOT NULL,
    "email_tutor" TEXT,
    "email_orientador" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Colegio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "id_carpeta_drive" TEXT,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3),
    "domicilio" TEXT NOT NULL,
    "curso" TEXT NOT NULL,
    "diagnostico" TEXT NOT NULL,
    "tratamientos" TEXT NOT NULL,
    "medicacion" TEXT NOT NULL,
    "alergias" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "adaptaciones" BOOLEAN NOT NULL DEFAULT false,
    "apoyos" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,
    "id_colegio" TEXT,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes_trabajadores" (
    "id_cliente" TEXT NOT NULL,
    "id_trabajador" TEXT NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo_terapia" TEXT,

    CONSTRAINT "clientes_trabajadores_pkey" PRIMARY KEY ("id_cliente","id_trabajador")
);

-- CreateTable
CREATE TABLE "Horario" (
    "id" TEXT NOT NULL,
    "fecha_hora_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_hora_fin" TIMESTAMP(3) NOT NULL,
    "tipo_sesion" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'programada',
    "notas" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,
    "id_cliente" TEXT NOT NULL,
    "id_trabajador" TEXT NOT NULL,

    CONSTRAINT "Horario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Informe" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_vencimiento" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "url_documento_final" TEXT,
    "fecha_creacion_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,
    "id_cliente" TEXT NOT NULL,
    "id_trabajador" TEXT NOT NULL,

    CONSTRAINT "Informe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Familiar" (
    "id" TEXT NOT NULL,
    "nombre_contacto" TEXT NOT NULL,
    "parentesco" TEXT,
    "telefono_madre" TEXT,
    "email_madre" TEXT,
    "telefono_padre" TEXT,
    "email_padre" TEXT,
    "telefono_whatsapp" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,
    "id_cliente" TEXT NOT NULL,

    CONSTRAINT "Familiar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroDiario" (
    "id" TEXT NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contenido" TEXT NOT NULL,
    "fecha_creacion_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,
    "id_cliente" TEXT NOT NULL,
    "id_trabajador" TEXT NOT NULL,

    CONSTRAINT "RegistroDiario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Objetivo" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin_prevista" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "fecha_creacion_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,
    "id_cliente" TEXT NOT NULL,
    "id_trabajador_responsable" TEXT NOT NULL,

    CONSTRAINT "Objetivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rol_nombre_rol_key" ON "Rol"("nombre_rol");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_codigo_rol_key" ON "Rol"("codigo_rol");

-- CreateIndex
CREATE UNIQUE INDEX "Trabajador_username_key" ON "Trabajador"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Trabajador_email_key" ON "Trabajador"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Colegio_nombre_key" ON "Colegio"("nombre");

-- AddForeignKey
ALTER TABLE "Trabajador" ADD CONSTRAINT "Trabajador_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_id_colegio_fkey" FOREIGN KEY ("id_colegio") REFERENCES "Colegio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes_trabajadores" ADD CONSTRAINT "clientes_trabajadores_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes_trabajadores" ADD CONSTRAINT "clientes_trabajadores_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Horario" ADD CONSTRAINT "Horario_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Horario" ADD CONSTRAINT "Horario_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Informe" ADD CONSTRAINT "Informe_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Informe" ADD CONSTRAINT "Informe_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Familiar" ADD CONSTRAINT "Familiar_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroDiario" ADD CONSTRAINT "RegistroDiario_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroDiario" ADD CONSTRAINT "RegistroDiario_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objetivo" ADD CONSTRAINT "Objetivo_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objetivo" ADD CONSTRAINT "Objetivo_id_trabajador_responsable_fkey" FOREIGN KEY ("id_trabajador_responsable") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
