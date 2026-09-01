process.env.SECRET = 'test-e2e-secret';

import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { EstadoSesion, TipoSesion } from '@prisma/client';
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

const testSesion = (overrides: Record<string, any> = {}) => ({
  id: 'sesion-e2e-1',
  clienteId: 'cliente-e2e-1',
  trabajadorId: 'trabajador-e2e',
  fechaHoraInicio: new Date('2026-03-10T09:00:00'),
  fechaHoraFin: new Date('2026-03-10T10:00:00'),
  estado: EstadoSesion.PROGRAMADA,
  tipoSesion: TipoSesion.PEDAGOGIA,
  notas: null,
  bonoId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('Sesiones (e2e)', () => {
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

    const setCookie: string = (loginRes.headers['set-cookie'] as string[] | undefined)?.[0] ?? '';
    accessToken = setCookie.split(';')[0].split('=').slice(1).join('=');
  });

  afterAll(async () => {
    await app.close();
  });

  // ── GET /api/sesiones/cliente/:id ─────────────────────────────────────────
  describe('GET /api/sesiones/cliente/:id', () => {
    it('devuelve 401 sin token', async () => {
      const res = await request(app.getHttpServer()).get('/api/sesiones/cliente/cliente-1');
      expect(res.status).toBe(401);
    });

    it('devuelve las sesiones del cliente paginadas', async () => {
      const sesiones = [testSesion(), testSesion({ id: 'sesion-e2e-2' })];
      prisma.sesion.findMany.mockResolvedValue(sesiones);
      prisma.sesion.count.mockResolvedValue(2);

      const res = await request(app.getHttpServer())
        .get('/api/sesiones/cliente/cliente-e2e-1')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Sobre doble: el ResponseInterceptor envuelve el sobre de paginacion
      expect(Array.isArray(res.body.data.data)).toBe(true);
      expect(res.body.data.data).toHaveLength(2);
      expect(res.body.data.total).toBe(2);
    });

    it('respeta page y limit de la query', async () => {
      prisma.sesion.findMany.mockResolvedValue([testSesion()]);
      prisma.sesion.count.mockResolvedValue(500);

      const res = await request(app.getHttpServer())
        .get('/api/sesiones/cliente/cliente-e2e-1?page=2&limit=10')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(500);
      expect(prisma.sesion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  // ── GET /api/sesiones/:id ─────────────────────────────────────────────────
  describe('GET /api/sesiones/:id', () => {
    it('devuelve 404 si la sesión no existe', async () => {
      prisma.sesion.findUnique.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get('/api/sesiones/sesion-inexistente')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('devuelve la sesión si existe', async () => {
      // PEDAGOGO role → service uses findFirst (soloAsignados = true)
      prisma.sesion.findFirst.mockResolvedValue(testSesion());

      const res = await request(app.getHttpServer())
        .get('/api/sesiones/sesion-e2e-1')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('sesion-e2e-1');
    });
  });

  // ── PATCH /api/sesiones/:id/completar ─────────────────────────────────────
  describe('PATCH /api/sesiones/:id/completar', () => {
    it('completa la sesión y devuelve estado COMPLETADA', async () => {
      const sesion = testSesion();
      const sesionCompletada = testSesion({ estado: EstadoSesion.COMPLETADA });

      prisma.sesion.findUnique.mockResolvedValue(sesion);
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          ...prisma,
          sesion: {
            ...prisma.sesion,
            update: jest.fn().mockResolvedValue(sesionCompletada),
          },
        };
        return fn(tx);
      });

      const res = await request(app.getHttpServer())
        .patch('/api/sesiones/sesion-e2e-1/completar')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ notas: 'Sesión completada correctamente' });

      expect(res.status).toBe(200);
      expect(res.body.data.sesion.estado).toBe(EstadoSesion.COMPLETADA);
    });
  });

  // ── PATCH /api/sesiones/:id/cancelar ──────────────────────────────────────
  describe('PATCH /api/sesiones/:id/cancelar', () => {
    it('cancela la sesión con aviso por defecto', async () => {
      prisma.sesion.findUnique.mockResolvedValue(testSesion());
      prisma.sesion.update.mockResolvedValue(
        testSesion({ estado: EstadoSesion.CANCELADA_CON_AVISO }),
      );

      const res = await request(app.getHttpServer())
        .patch('/api/sesiones/sesion-e2e-1/cancelar')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.data.estado).toBe(EstadoSesion.CANCELADA_CON_AVISO);
    });

    it('cancela sin aviso cuando conAviso=false', async () => {
      prisma.sesion.findUnique.mockResolvedValue(testSesion());
      prisma.sesion.update.mockResolvedValue(
        testSesion({ estado: EstadoSesion.CANCELADA_SIN_AVISO }),
      );

      const res = await request(app.getHttpServer())
        .patch('/api/sesiones/sesion-e2e-1/cancelar')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ conAviso: false });

      expect(res.status).toBe(200);
      expect(res.body.data.estado).toBe(EstadoSesion.CANCELADA_SIN_AVISO);
    });
  });
});
