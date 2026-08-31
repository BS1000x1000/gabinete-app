import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando seed ---');

  // ── Roles ──────────────────────────────────────────────────────
  const rolesData = [
    { nombreRol: 'Administrador',    codigo: 'ADMIN',    descripcion: 'Acceso total al sistema' },
    { nombreRol: 'Pedagogo/a',       codigo: 'PEDAGOGO', descripcion: 'Pedagogía terapéutica' },
    { nombreRol: 'Neuropsicólogo/a', codigo: 'NEURO',    descripcion: 'Neuropsicología' },
    { nombreRol: 'Logopeda',         codigo: 'LOGOPEDA', descripcion: 'Logopedia' },
    { nombreRol: 'Recepcionista',    codigo: 'RECEP',    descripcion: 'Gestión y recepción' },
  ];

  const roles: Record<string, { id: string }> = {};
  for (const r of rolesData) {
    roles[r.codigo] = await prisma.rol.upsert({
      where: { codigo: r.codigo },
      update: {},
      create: r,
    });
    console.log(`Rol: ${r.codigo}`);
  }

  // ── Admin ───────────────────────────────────────────────────────
  // Contraseña inicial: Admin1234!  (cámbiala tras el primer login)
  const adminHash = await bcrypt.hash('Admin1234!', 10);
  await prisma.trabajador.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminHash,
      nombre: 'Admin',
      apellidos: 'Sistema',
      email: 'admin@gabinete.local',
      rolId: roles['ADMIN'].id,
      activo: true,
    },
  });
  console.log('Trabajador admin creado — usuario: admin / contraseña: Admin1234!');

  // ── Áreas de desarrollo ────────────────────────────────────────
  const areasData = [
    { nombre: 'Procesos Cognitivos Básicos',  descripcion: 'Atención, memoria y percepción',                            color: '#3a5c74', orden: 1 },
    { nombre: 'Funciones Ejecutivas',         descripcion: 'Planificación, inhibición y flexibilidad cognitiva',         color: '#96382e', orden: 2 },
    { nombre: 'Lectura',                      descripcion: 'Conciencia fonológica, decodificación y comprensión lectora', color: '#345c6b', orden: 3 },
    { nombre: 'Escritura',                    descripcion: 'Grafomotricidad, ortografía y expresión escrita',            color: '#6b5a8a', orden: 4 },
    { nombre: 'Lenguaje y Comunicación',      descripcion: 'Expresión oral, comprensión verbal y vocabulario',           color: '#8a4a63', orden: 5 },
    { nombre: 'Matemáticas',                  descripcion: 'Cálculo, razonamiento y resolución de problemas',            color: '#8a6018', orden: 6 },
    { nombre: 'Técnicas de Estudio',          descripcion: 'Organización, planificación y hábitos de estudio',           color: '#2f6b43', orden: 7 },
    { nombre: 'Emociones',                    descripcion: 'Identificación y expresión emocional',                       color: '#a5622a', orden: 8 },
  ];

  const areaIds: Record<string, string> = {};
  for (const area of areasData) {
    const a = await prisma.areaDesarrollo.upsert({
      where: { nombre: area.nombre },
      update: {},
      create: area,
    });
    areaIds[area.nombre] = a.id;
    console.log(`Área: ${area.nombre}`);
  }

  // ── Objetivos generales ────────────────────────────────────────
  const objetivosData: Record<string, string[]> = {
    'Procesos Cognitivos Básicos': [
      'Atención Dividida', 'Atención Sostenida', 'Atención Visual', 'Atención Auditiva',
      'Memoria Episódica', 'Memoria Espacial', 'Memoria Procedimental',
      'MLP Visual', 'MLP Auditiva', 'Visión Espacial',
    ],
    'Funciones Ejecutivas': [
      'Memoria de Trabajo Visual', 'Memoria de Trabajo Auditiva', 'Memoria Semántica',
      'Velocidad de Procesamiento', 'Inhibición', 'Atención Selectiva', 'Control Atencional',
      'Flexibilidad Cognitiva', 'Razonamiento', 'Planificación',
    ],
    'Lectura': [
      'Conciencia Fonológica', 'Conciencia Fonémica', 'Conciencia Silábica', 'Conciencia Léxica',
      'Correspondencia Grafema-Fonema',
      'Lectura Ruta Léxica', 'Lectura Ruta Fonológica',
      'Precisión Lectora', 'Velocidad Lectora', 'Fluidez Lectora', 'Entonación y Prosodia',
      'Comprension Lectora', 'Comprensión Lectora de Instrucciones',
      'Comprensión Lectora Literal', 'Comprensión Lectora Inferencial',
    ],
    'Escritura': [
      'Correspondencia Fonema-Grafema', 'Tamaño y Forma de las Letras', 'Legibilidad',
      'Velocidad de Escritura', 'Ortografía Natural', 'Ortografía Arbitraria', 'Ortografía Reglada',
      'Signos de Puntuación', 'Construcción de Frases', 'Cohesión', 'Coherencia',
      'Dictado', 'Copia Escrita', 'Expresión Escrita',
    ],
    'Lenguaje y Comunicación': [
      'Comprensión Verbal', 'Expresión Oral', 'Narración', 'Vocabulario',
      'Uso del Lenguaje para Pedir Ayuda', 'Uso del Lenguaje para Explicar Dificultades',
    ],
    'Matemáticas': [
      'Comprensión de Consignas Matemáticas', 'Resolución de Problemas', 'Uso de Estrategias',
    ],
    'Técnicas de Estudio': [
      'Hábito de Estudio', 'Organización del Contenido Curricular', 'Planificación de Tareas Académicas',
      'Uso Funcional de la Agenda', 'Secuenciación de Tareas', 'Gestión del Tiempo y Pausas Funcionales',
      'Inicio Autónomo', 'Persistencia ante la Dificultad',
      'Lectura Comprensiva de Textos de Estudio', 'Síntesis y Organización de la Información',
      'Identificación de Ideas Principales', 'Subrayado Funcional', 'Mapas Conceptuales',
      'Jerarquización de Ideas Principales', 'Resúmenes', 'Representaciones Gráficas',
      'Uso de Reglas Mnemotécnicas', 'Autoevaluación',
    ],
    'Emociones': [
      'Identificación Emociones', 'Expresión Emociones',
    ],
  };

  let objetivosCreados = 0;
  for (const [areaNombre, titulos] of Object.entries(objetivosData)) {
    const areaId = areaIds[areaNombre];
    if (!areaId) { console.warn(`  Área no encontrada: ${areaNombre}`); continue; }

    const existentes = await prisma.objetivoGeneral.findMany({
      where: { areaDesarrolloId: areaId },
      select: { titulo: true },
    });
    const existentesSet = new Set(existentes.map((o) => o.titulo));
    const nuevos = titulos.filter((t) => !existentesSet.has(t));

    if (nuevos.length > 0) {
      await prisma.objetivoGeneral.createMany({
        data: nuevos.map((titulo) => ({ titulo, areaDesarrolloId: areaId })),
      });
      objetivosCreados += nuevos.length;
    }
  }
  console.log(`Objetivos generales creados: ${objetivosCreados}`);

  console.log('--- Seed finalizado ---');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
