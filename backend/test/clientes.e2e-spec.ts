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

const testCliente = (overrides: Record<string, any> = {}) => ({
  id: 'cliente-e2e-1',
  nombre: 'Ana',
  apellidos: 'García',
  dni: '12345678A',
  domicilio: 'Calle Mayor 1',
  provincia: 'Madrid',
  ciudad: 'Madrid',
  curso: '3º Primaria',
  activo: true,
  fechaNacimiento: null,
  fechaInicio: null,
  colegioId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  trabajadoresAsignados: [],
  sesiones: [],
  bonos: [],
  informes: [],
  contactosFamiliares: [],
  sanitario: null,
  ...overrides,
});

describe('Clientes (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaMock;
  let accessToken: string;

  beforeAll(async () => {
    prisma = createPrismaMock();
    app = await createTestApp(prisma);
    await app.init();

    // Login para obtener token (usado en rutas protegidas)
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

  // ── GET /api/clientes ─────────────────────────────────────────────────────
  describe('GET /api/clientes', () => {
    it('devuelve la lista de clientes', async () => {
      const clientes = [testCliente(), testCliente({ id: 'cliente-e2e-2', dni: '87654321B' })];
      prisma.cliente.findMany.mockResolvedValue(clientes);

      const res = await request(app.getHttpServer()).get('/api/clientes');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });
  });

  // ── GET /api/clientes/verificar-dni/:dni ──────────────────────────────────
  describe('GET /api/clientes/verificar-dni/:dni', () => {
    it('devuelve disponible=true cuando el DNI no está registrado', async () => {
      prisma.cliente.findFirst.mockResolvedValue(null);
      prisma.cliente.findUnique.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get('/api/clientes/verificar-dni/99999999Z');

      expect(res.status).toBe(200);
      expect(res.body.data.disponible).toBe(true);
      expect(res.body.data.dni).toBe('99999999Z');
    });

    it('devuelve disponible=false cuando el DNI ya existe', async () => {
      // dni es @unique en schema → existeDni usa findUnique o findFirst con where:{dni}
      prisma.cliente.findFirst.mockResolvedValue(testCliente());
      prisma.cliente.findUnique.mockResolvedValue(testCliente());

      const res = await request(app.getHttpServer()).get(
        '/api/clientes/verificar-dni/12345678A',
      );

      expect(res.status).toBe(200);
      expect(res.body.data.disponible).toBe(false);
    });
  });

  // ── GET /api/clientes/:id ─────────────────────────────────────────────────
  describe('GET /api/clientes/:id', () => {
    it('devuelve 404 si el cliente no existe', async () => {
      prisma.cliente.findUnique.mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get('/api/clientes/cliente-inexistente');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('devuelve el cliente si existe', async () => {
      prisma.cliente.findUnique.mockResolvedValue(testCliente());

      const res = await request(app.getHttpServer()).get('/api/clientes/cliente-e2e-1');

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('cliente-e2e-1');
      expect(res.body.data.nombre).toBe('Ana');
    });
  });

  // ── POST /api/clientes ────────────────────────────────────────────────────
  describe('POST /api/clientes', () => {
    it('crea un cliente y devuelve 201', async () => {
      const dto = {
        nombre: 'Pedro',
        apellidos: 'López',
        dni: '11111111C',
        domicilio: 'Calle Sol 5',
        provincia: 'Madrid',
        ciudad: 'Madrid',
        curso: '2º ESO',
        fechaNacimiento: '2015-06-15',
        fechaInicio: '2026-01-10',
      };
      const clienteNuevo = testCliente({ ...dto, id: 'cliente-nuevo' });

      prisma.cliente.findFirst.mockResolvedValue(null);
      // Primera llamada: comprobación de DNI existente → null
      // Siguiente(s): fetch post-creación → cliente creado
      prisma.cliente.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValue(clienteNuevo);
      prisma.cliente.create.mockResolvedValue(clienteNuevo);

      const res = await request(app.getHttpServer())
        .post('/api/clientes')
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  // ── GET /api/clientes/mis-clientes ────────────────────────────────────────
  describe('GET /api/clientes/mis-clientes', () => {
    it('devuelve 401 sin token', async () => {
      const res = await request(app.getHttpServer()).get('/api/clientes/mis-clientes');
      expect(res.status).toBe(401);
    });

    it('devuelve los clientes asignados al terapeuta autenticado', async () => {
      prisma.clienteTrabajador.findMany.mockResolvedValue([
        { clienteId: 'cliente-e2e-1', cliente: testCliente() },
      ]);
      // findByTrabajador puede usar cliente.findMany con relaciones
      prisma.cliente.findMany.mockResolvedValue([testCliente()]);

      const res = await request(app.getHttpServer())
        .get('/api/clientes/mis-clientes')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── DELETE /api/clientes/:id ──────────────────────────────────────────────
  describe('DELETE /api/clientes/:id', () => {
    it('elimina el cliente y devuelve la respuesta formateada', async () => {
      prisma.cliente.delete.mockResolvedValue(testCliente());

      const res = await request(app.getHttpServer()).delete('/api/clientes/cliente-e2e-1');

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('Cliente eliminado correctamente');
      expect(res.body.data.id).toBe('cliente-e2e-1');
      expect(res.body.data.status).toBe('success');
    });
  });
});
