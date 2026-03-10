process.env.SECRET = 'test-e2e-secret';

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { createTestApp } from './helpers/create-app';
import { createPrismaMock, PrismaMock } from './helpers/prisma-mock';

const TEST_HASH = bcrypt.hashSync('Test123!', 1);

const testUser = {
  id: 'trabajador-e2e',
  username: 'terapeuta_test',
  passwordHash: TEST_HASH,
  nombre: 'Luis',
  apellidos: 'Pérez',
  email: 'luis@test.es',
  activo: true,
  rolId: 'rol-1',
  rol: { id: 'rol-1', nombreRol: 'Pedagogo', codigo: 'PEDAGOGO' },
  resetPasswordToken: null,
  resetPasswordExpires: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const testBono = (overrides: Record<string, any> = {}) => ({
  id: 'bono-e2e-1',
  clienteId: 'cliente-e2e-1',
  totalSesiones: 10,
  sesionesConsumidas: 0,
  precio: 500,
  estado: 'ACTIVO',
  pagado: false,
  metodoPago: null,
  fechaPago: null,
  fechaInicio: new Date(),
  fechaFin: null,
  notas: null,
  familiarPagoId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('Bonos (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaMock;
  let accessToken: string;

  beforeAll(async () => {
    prisma = createPrismaMock();
    app = await createTestApp(prisma);
    await app.init();

    // Login para obtener token
    prisma.trabajador.findFirst.mockResolvedValue(testUser);
    prisma.trabajador.findUnique.mockResolvedValue(testUser);

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'terapeuta_test', password: 'Test123!' });

    accessToken = loginRes.body.data.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  // ── GET /api/bonos/cliente/:id ────────────────────────────────────────────
  describe('GET /api/bonos/cliente/:id', () => {
    it('devuelve 401 sin token', async () => {
      const res = await request(app.getHttpServer()).get('/api/bonos/cliente/cliente-1');
      expect(res.status).toBe(401);
    });

    it('devuelve la lista de bonos del cliente', async () => {
      const bonos = [testBono(), testBono({ id: 'bono-e2e-2', estado: 'CONSUMIDO' })];
      prisma.bono.findMany.mockResolvedValue(bonos);

      const res = await request(app.getHttpServer())
        .get('/api/bonos/cliente/cliente-e2e-1')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });
  });

  // ── POST /api/bonos ───────────────────────────────────────────────────────
  describe('POST /api/bonos', () => {
    // Usar UUID válido — el DTO tiene @IsUUID()
    const CLIENTE_UUID = '550e8400-e29b-41d4-a716-446655440001';

    it('crea un bono y devuelve 201', async () => {
      prisma.bono.findFirst.mockResolvedValue(null); // sin bono activo previo
      prisma.bono.create.mockResolvedValue(testBono({ clienteId: CLIENTE_UUID }));

      const res = await request(app.getHttpServer())
        .post('/api/bonos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ clienteId: CLIENTE_UUID, totalSesiones: 10, precio: 500 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.estado).toBe('ACTIVO');
    });

    it('devuelve 409 si ya existe bono activo para el cliente', async () => {
      prisma.bono.findFirst.mockResolvedValue(testBono()); // bono activo existente

      const res = await request(app.getHttpServer())
        .post('/api/bonos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ clienteId: CLIENTE_UUID, totalSesiones: 10, precio: 500 });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  // ── PATCH /api/bonos/:id/registrar-pago ───────────────────────────────────
  describe('PATCH /api/bonos/:id/registrar-pago', () => {
    it('registra el pago y devuelve pagado=true', async () => {
      prisma.bono.findUnique.mockResolvedValue(testBono());
      prisma.bono.update.mockResolvedValue(testBono({ pagado: true, metodoPago: 'EFECTIVO' }));

      const res = await request(app.getHttpServer())
        .patch('/api/bonos/bono-e2e-1/registrar-pago')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ metodoPago: 'EFECTIVO' });

      expect(res.status).toBe(200);
      expect(res.body.data.pagado).toBe(true);
      expect(res.body.data.metodoPago).toBe('EFECTIVO');
    });

    it('devuelve 400 si el bono ya está pagado', async () => {
      prisma.bono.findUnique.mockResolvedValue(testBono({ pagado: true }));

      const res = await request(app.getHttpServer())
        .patch('/api/bonos/bono-e2e-1/registrar-pago')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ metodoPago: 'EFECTIVO' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ── PATCH /api/bonos/:id/cancelar ─────────────────────────────────────────
  describe('PATCH /api/bonos/:id/cancelar', () => {
    it('cancela el bono y devuelve estado CANCELADO', async () => {
      prisma.bono.findUnique.mockResolvedValue(testBono());
      prisma.bono.update.mockResolvedValue(testBono({ estado: 'CANCELADO' }));

      const res = await request(app.getHttpServer())
        .patch('/api/bonos/bono-e2e-1/cancelar')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.estado).toBe('CANCELADO');
    });

    it('devuelve 404 si el bono no existe', async () => {
      prisma.bono.findUnique.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .patch('/api/bonos/bono-inexistente/cancelar')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
