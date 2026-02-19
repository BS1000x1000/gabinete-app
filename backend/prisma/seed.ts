import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando reseteo y siembra de datos ---');

  // 1. Crear Roles Básicos
  const rolAdmin = await prisma.rol.upsert({
    where: { codigo: 'ADMIN' },
    update: {},
    create: {
      nombreRol: 'Administrador',
      codigo: 'ADMIN',
      descripcion: 'Acceso total al sistema',
    },
  });

  const rolTerapeuta = await prisma.rol.upsert({
    where: { codigo: 'TERAPEUTA' },
    update: {},
    create: {
      nombreRol: 'Terapeuta',
      codigo: 'TERAPEUTA',
      descripcion: 'Gestión de sus propios clientes e informes',
    },
  });

  // 2. Crear un Trabajador Administrador por defecto
  // Nota: En un entorno real, la contraseña debería estar hasheada con bcrypt
  const adminUser = await prisma.trabajador.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: '12345', // Cambiar por hash real
      nombre: 'Admin',
      apellidos: 'Sistema',
      email: 'admin@centro.com',
      rolId: rolAdmin.id,
      activo: true,
    },
  });

  console.log({ rolAdmin, rolTerapeuta, adminUser });
  console.log('--- Semilla finalizada con éxito ---');
}

main()
  .catch((e) => {
    console.error("Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
