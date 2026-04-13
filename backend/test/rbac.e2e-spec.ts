/**
 * RBAC (e2e) — verifica que los guards de roles devuelven 403
 * cuando un rol sin permisos intenta acceder a endpoints clínicos.
 *
 * Escenarios cubiertos:
 *   RECEP → endpoints clínicos   → 403
 *   RECEP → endpoints permitidos → 200 / 201
 *   PEDAGOGO → endpoints clínicos → 200 / 201
 *   PEDAGOGO → estadísticas generales (solo ADMIN/RECEP) → 403
 */
process.env.SECRET = 'test-e2e-secret';

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { createTestApp } from './helpers/create-app';
import { createPrismaMock, PrismaMock } from './helpers/prisma-mock';

const TEST_HASH = bcrypt.hashSync('Test123!', 1);

// ── Fixtures de usuario ───────────────────────────────────────────────────────

interface TestUserOverrides {
  id: string;
  username: string;
  rol: { id: string; nombreRol: string; codigo: string };
}

const mkUser = (overrides: TestUserOverrides) => ({
  passwordHash: TEST_HASH,
  activo: true,
  nombre: 'Test',
  apellidos: 'User',
  email: 'test@test.es',
  rolId: 'rol-1',
  resetPasswordToken: null as null,
  resetPasswordExpires: null as null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const recepUser = mkUser({
  id: 'recep-e2e-1',
  username: 'recepcion_test',
  rol: { id: 'rol-recep', nombreRol: 'Recepcionista', codigo: 'RECEP' },
});

const pedagogoUser = mkUser({
  id: 'pedagogo-e2e-1',
  username: 'pedagogo_test',
  rol: { id: 'rol-ped', nombreRol: 'Pedagogo', codigo: 'PEDAGOGO' },
});

const adminUser = mkUser({
  id: 'admin-e2e-1',
  username: 'admin_test',
  rol: { id: 'rol-admin', nombreRol: 'Administrador', codigo: 'ADMIN' },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function loginAs(
  app: INestApplication,
  prisma: PrismaMock,
  user: typeof recepUser,
): Promise<string> {
  prisma.trabajador.findFirst.mockResolvedValue(user);
  prisma.trabajador.findUnique.mockResolvedValue(user);

  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ username: user.username, password: 'Test123!' });

  return res.body.data.access_token;
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('RBAC (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaMock;
  let tokenRecep: string;
  let tokenPedagogo: string;
  let tokenAdmin: string;

  beforeAll(async () => {
    prisma = createPrismaMock();
    app = await createTestApp(prisma);
    await app.init();

    tokenRecep    = await loginAs(app, prisma, recepUser);
    tokenPedagogo = await loginAs(app, prisma, pedagogoUser);
    tokenAdmin    = await loginAs(app, prisma, adminUser);
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Registros diarios (/registros) ────────────────────────────────────────

  describe('/api/registros — solo ROLES_CLINICOS', () => {
    it('RECEP: POST /api/registros → 403', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/registros')
        .set('Authorization', `Bearer ${tokenRecep}`)
        .send({ clienteId: 'c1', contenido: 'test' });

      expect(res.status).toBe(403);
    });

    it('RECEP: GET /api/registros/cliente/c1 → 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/registros/cliente/c1')
        .set('Authorization', `Bearer ${tokenRecep}`);

      expect(res.status).toBe(403);
    });

    it('PEDAGOGO: GET /api/registros/cliente/c1 → pasa el guard (puede ser 404 si cliente no existe)', async () => {
      prisma.registroDiario.findMany.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get('/api/registros/cliente/c1')
        .set('Authorization', `Bearer ${tokenPedagogo}`);

      expect(res.status).not.toBe(403);
    });
  });

  // ── GAS (/gas) ────────────────────────────────────────────────────────────

  describe('/api/gas — solo ROLES_CLINICOS', () => {
    it('RECEP: POST /api/gas/objetivo/x/evaluaciones → 403', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/gas/objetivo/x/evaluaciones')
        .set('Authorization', `Bearer ${tokenRecep}`)
        .send({ nivel: 0, fecha: new Date().toISOString() });

      expect(res.status).toBe(403);
    });

    it('RECEP: POST /api/gas/objetivo/x/niveles → 403', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/gas/objetivo/x/niveles')
        .set('Authorization', `Bearer ${tokenRecep}`)
        .send({ niveles: [] });

      expect(res.status).toBe(403);
    });

    it('PEDAGOGO: GET /api/gas/objetivo/x → pasa el guard (puede ser 404 por no existir)', async () => {
      prisma.clienteObjetivo.findUnique.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get('/api/gas/objetivo/x')
        .set('Authorization', `Bearer ${tokenPedagogo}`);

      // 404 es correcto — el objeto no existe, pero el guard dejó pasar
      expect(res.status).not.toBe(403);
    });
  });

  // ── Informes (/informes) ──────────────────────────────────────────────────

  describe('/api/informes — escritura solo ROLES_CLINICOS', () => {
    it('RECEP: POST /api/informes → 403', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/informes')
        .set('Authorization', `Bearer ${tokenRecep}`)
        .send({ clienteId: 'c1', tipoInforme: 'INICIAL', titulo: 'Test' });

      expect(res.status).toBe(403);
    });

    it('RECEP: PATCH /api/informes/inf-1 → 403', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/informes/inf-1')
        .set('Authorization', `Bearer ${tokenRecep}`)
        .send({ titulo: 'Nuevo título' });

      expect(res.status).toBe(403);
    });

    it('RECEP: DELETE /api/informes/inf-1 → 403', async () => {
      const res = await request(app.getHttpServer())
        .delete('/api/informes/inf-1')
        .set('Authorization', `Bearer ${tokenRecep}`);

      expect(res.status).toBe(403);
    });

    it('RECEP: GET /api/informes/cliente/c1 → 200 (solo lectura permitida)', async () => {
      prisma.cliente.findUnique.mockResolvedValue({ id: 'c1' });
      prisma.informe.findMany.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get('/api/informes/cliente/c1')
        .set('Authorization', `Bearer ${tokenRecep}`);

      expect(res.status).toBe(200);
    });

    it('PEDAGOGO: POST /api/informes → pasa el guard (puede ser 4xx por validación)', async () => {
      prisma.cliente.findUnique.mockResolvedValue(null); // cliente no existe → 404

      const res = await request(app.getHttpServer())
        .post('/api/informes')
        .set('Authorization', `Bearer ${tokenPedagogo}`)
        .send({ clienteId: 'no-existe', tipoInforme: 'INICIAL', titulo: 'Test' });

      expect(res.status).not.toBe(403);
    });
  });

  // ── Objetivos de cliente (/clientes/:id/objetivos-generales) ──────────────

  describe('/api/clientes/:id/objetivos-generales — escritura solo ROLES_CLINICOS', () => {
    it('RECEP: POST /api/clientes/c1/objetivos-generales → 403', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/clientes/c1/objetivos-generales')
        .set('Authorization', `Bearer ${tokenRecep}`)
        .send({ objetivosGeneralesIds: ['obj-1'] });

      expect(res.status).toBe(403);
    });

    it('RECEP: DELETE /api/clientes/c1/objetivos-generales/obj-1 → 403', async () => {
      const res = await request(app.getHttpServer())
        .delete('/api/clientes/c1/objetivos-generales/obj-1')
        .set('Authorization', `Bearer ${tokenRecep}`);

      expect(res.status).toBe(403);
    });

    it('RECEP: PATCH /api/clientes/c1/sanitario → 403', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/clientes/c1/sanitario')
        .set('Authorization', `Bearer ${tokenRecep}`)
        .send({ diagnostico: 'test' });

      expect(res.status).toBe(403);
    });
  });

  // ── Dashboard — estadísticas generales (solo ROLES_GESTION) ──────────────

  describe('/api/dashboard/estadisticas-generales — solo ROLES_GESTION', () => {
    it('PEDAGOGO: → 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dashboard/estadisticas-generales')
        .set('Authorization', `Bearer ${tokenPedagogo}`);

      expect(res.status).toBe(403);
    });

    it('ADMIN: → 200', async () => {
      prisma.cliente.count.mockResolvedValue(10);
      prisma.trabajador.count.mockResolvedValue(3);
      prisma.sesion.count.mockResolvedValue(50);
      prisma.registroDiario.count.mockResolvedValue(20);
      prisma.objetivoGeneral.count.mockResolvedValue(30);
      prisma.areaDesarrollo.count.mockResolvedValue(5);

      const res = await request(app.getHttpServer())
        .get('/api/dashboard/estadisticas-generales')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      expect(res.status).toBe(200);
    });

    it('RECEP: → 200', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dashboard/estadisticas-generales')
        .set('Authorization', `Bearer ${tokenRecep}`);

      expect(res.status).toBe(200);
    });
  });

  // ── Sin token → 401 (verificación de JwtAuthGuard activo) ────────────────

  describe('Sin token', () => {
    it('GET /api/registros/cliente/c1 sin token → 401', async () => {
      const res = await request(app.getHttpServer()).get('/api/registros/cliente/c1');
      expect(res.status).toBe(401);
    });

    it('GET /api/informes/cliente/c1 sin token → 401', async () => {
      const res = await request(app.getHttpServer()).get('/api/informes/cliente/c1');
      expect(res.status).toBe(401);
    });
  });
});
