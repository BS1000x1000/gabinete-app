process.env.SECRET = 'test-e2e-secret';

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { createTestApp } from './helpers/create-app';
import { createPrismaMock, PrismaMock } from './helpers/prisma-mock';

// Hash de la contraseña de test generado una sola vez
const TEST_PASSWORD = 'Test123!';
const TEST_HASH = bcrypt.hashSync(TEST_PASSWORD, 1);

const testUser = {
  id: 'user-e2e-1',
  username: 'terapeuta_test',
  passwordHash: TEST_HASH,
  nombre: 'Laura',
  apellidos: 'Martín',
  email: 'laura@test.es',
  activo: true,
  telefono: null,
  img: null,
  rolId: 'rol-1',
  rol: { id: 'rol-1', nombreRol: 'Pedagogo', codigo: 'PEDAGOGO' },
  resetPasswordToken: null,
  resetPasswordExpires: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaMock;
  let accessToken: string;

  beforeAll(async () => {
    prisma = createPrismaMock();
    app = await createTestApp(prisma);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ── POST /api/auth/login ──────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    it('devuelve 401 con credenciales incorrectas', async () => {
      prisma.trabajador.findFirst.mockResolvedValue(null);
      prisma.trabajador.findUnique.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'noexiste', password: 'mal' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('devuelve 200 con access_token al hacer login correcto', async () => {
      prisma.trabajador.findFirst.mockResolvedValue(testUser);
      prisma.trabajador.findUnique.mockResolvedValue(testUser);

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'terapeuta_test', password: TEST_PASSWORD });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.access_token).toBeDefined();
      expect(res.body.data.token_type).toBe('Bearer');
      expect(res.body.data.user.username).toBe('terapeuta_test');

      // Guardamos el token para los tests siguientes
      accessToken = res.body.data.access_token;
    });
  });

  // ── GET /api/auth/verify ──────────────────────────────────────────────────
  describe('GET /api/auth/verify', () => {
    it('devuelve 401 sin token', async () => {
      const res = await request(app.getHttpServer()).get('/api/auth/verify');
      expect(res.status).toBe(401);
    });

    it('devuelve 200 y valid=true con token válido', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.valid).toBe(true);
      expect(res.body.data.user.username).toBe('terapeuta_test');
    });
  });

  // ── GET /api/auth/profile ─────────────────────────────────────────────────
  describe('GET /api/auth/profile', () => {
    it('devuelve 401 sin token', async () => {
      const res = await request(app.getHttpServer()).get('/api/auth/profile');
      expect(res.status).toBe(401);
    });

    it('devuelve el perfil del trabajador autenticado', async () => {
      prisma.trabajador.findUnique.mockResolvedValue(testUser);

      const res = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.username).toBe('terapeuta_test');
    });
  });

  // ── POST /api/auth/forgot-password ────────────────────────────────────────
  describe('POST /api/auth/forgot-password', () => {
    it('devuelve mensaje genérico independientemente de si el email existe', async () => {
      // Resetear ambos métodos para que el email no sea encontrado
      prisma.trabajador.findFirst.mockResolvedValue(null);
      prisma.trabajador.findUnique.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'noexiste@test.es' });

      expect(res.status).toBe(200);
      expect(res.body.data.message).toContain('Si el email existe');
    });
  });
});
