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
  resetPasswordToken: null,
  resetPasswordExpires: null,
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

  // JWT goes in HttpOnly cookie — extract from Set-Cookie header
  const setCookie: string =
    (res.headers['set-cookie'] as string[] | undefined)?.[0] ?? '';
  const token = setCookie.split(';')[0].split('=').slice(1).join('=');
  return token;
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

    tokenRecep = await loginAs(app, prisma, recepUser);
    tokenPedagogo = await loginAs(app, prisma, pedagogoUser);
    tokenAdmin = await loginAs(app, prisma, adminUser);
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
        .send({
          clienteId: 'no-existe',
          tipoInforme: 'INICIAL',
          titulo: 'Test',
        });

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

  // ── Consentimiento RGPD ──────────────────────────────────────────────────
  // El registro manual es la excepcion (papel firmado fuera de la app) y queda
  // en ADMIN; revocar lo puede hacer tambien quien atiende a la familia.

  describe('/api/clientes/:id/consentimiento — registro manual solo ADMIN', () => {
    it('RECEP: POST /api/clientes/c1/consentimiento → 403', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/clientes/c1/consentimiento')
        .set('Authorization', `Bearer ${tokenRecep}`)
        .field('firmanteIds', '11111111-1111-4111-8111-111111111111')
        .field('versionTexto', 'papel externo 2024')
        .field('motivoRegistroManual', 'cartera anterior a la app')
        .attach('fichero', Buffer.from('%PDF-fake'), 'firmado.pdf');

      expect(res.status).toBe(403);
    });

    it('PEDAGOGO: POST /api/clientes/c1/consentimiento → 403', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/clientes/c1/consentimiento')
        .set('Authorization', `Bearer ${tokenPedagogo}`)
        .field('firmanteIds', '11111111-1111-4111-8111-111111111111')
        .field('versionTexto', 'papel externo 2024')
        .field('motivoRegistroManual', 'cartera anterior a la app')
        .attach('fichero', Buffer.from('%PDF-fake'), 'firmado.pdf');

      expect(res.status).toBe(403);
    });

    it('ADMIN sin adjuntar el escaneado → 400: sin evidencia no se registra', async () => {
      prisma.cliente.findFirst.mockResolvedValue({ id: 'c1' });

      const res = await request(app.getHttpServer())
        .post('/api/clientes/c1/consentimiento')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .field('firmanteIds', '11111111-1111-4111-8111-111111111111')
        .field('versionTexto', 'papel externo 2024')
        .field('motivoRegistroManual', 'cartera anterior a la app');

      expect(res.status).toBe(400);
    });
  });

  describe('/api/clientes/:id/consentimiento — firman uno o los dos tutores', () => {
    it('acepta dos firmantes en el mismo multipart', async () => {
      prisma.cliente.findFirst.mockResolvedValue({ id: 'c1' });
      // Solo uno de los dos es tutor legal → el registro se rechaza entero.
      prisma.familiar.findMany.mockResolvedValue([
        {
          id: '11111111-1111-4111-8111-111111111111',
          esTutorLegal: true,
          nombre: 'Madre',
          apellidos: 'Uno',
        },
        {
          id: '22222222-2222-4222-8222-222222222222',
          esTutorLegal: false,
          nombre: 'Abuela',
          apellidos: 'Dos',
        },
      ]);

      const res = await request(app.getHttpServer())
        .post('/api/clientes/c1/consentimiento')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .field('firmanteIds', '11111111-1111-4111-8111-111111111111')
        .field('firmanteIds', '22222222-2222-4222-8222-222222222222')
        .field('versionTexto', 'papel externo 2024')
        .field('motivoRegistroManual', 'cartera anterior a la app')
        .attach('fichero', Buffer.from('%PDF-fake'), 'firmado.pdf');

      // Pasa la validación del DTO (dos UUID) y muere en la regla de negocio,
      // que es exactamente donde debe morir.
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('tutor legal');
    });

    it('sin ningún firmante → 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/clientes/c1/consentimiento')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .field('versionTexto', 'papel externo 2024')
        .field('motivoRegistroManual', 'cartera anterior a la app')
        .attach('fichero', Buffer.from('%PDF-fake'), 'firmado.pdf');

      expect(res.status).toBe(400);
    });
  });

  describe('/api/clientes/:id/consentimiento/revocar', () => {
    it('no se puede revocar lo que nunca se otorgó → 400', async () => {
      prisma.cliente.findFirst.mockResolvedValue({ id: 'c1' });
      prisma.consentimientoRgpd.findFirst.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/api/clientes/c1/consentimiento/revocar')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ motivo: 'la familia lo solicita por escrito' });

      expect(res.status).toBe(400);
    });

    it('sin motivo → 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/clientes/c1/consentimiento/revocar')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('Alta de cliente — nace sin consentimiento', () => {
    it('el alta ya no acepta declarar el consentimiento: se rechaza el campo', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/clientes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          nombre: 'Ana',
          apellidos: 'García',
          fechaNacimiento: '2016-01-01',
          domicilio: 'Calle X',
          provincia: 'Madrid',
          ciudad: 'Madrid',
          curso: '3EP',
          // Este campo ya no existe en el DTO. Con forbidNonWhitelisted, mandarlo
          // es un 400: nadie puede volver a declarar una firma que no ha ocurrido.
          consentimientoRgpd: true,
        });

      expect(res.status).toBe(400);
    });
  });

  // ── Bloque administrativo: RECEP fuera, cada autónomo con lo suyo ────────

  /**
   * La facturación es asunto de cada autónomo, no de recepción. Hasta ahora el
   * bloqueo de RECEP vivía solo en el `roleGuard` del frontend: el backend le
   * dejaba pasar el guard y solo el data scoping le devolvía listas vacías.
   */
  describe('/api/facturas y /api/contratos — RECEP fuera del bloque administrativo', () => {
    it('RECEP: GET /api/facturas → 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/facturas')
        .set('Authorization', `Bearer ${tokenRecep}`);

      expect(res.status).toBe(403);
    });

    it('RECEP: GET /api/contratos → 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/contratos')
        .set('Authorization', `Bearer ${tokenRecep}`);

      expect(res.status).toBe(403);
    });

    it('RECEP: GET /api/contratos/cliente/c1 → 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/contratos/cliente/c1')
        .set('Authorization', `Bearer ${tokenRecep}`);

      expect(res.status).toBe(403);
    });

    it('RECEP: GET /api/horarios-admin → 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/horarios-admin')
        .set('Authorization', `Bearer ${tokenRecep}`);

      expect(res.status).toBe(403);
    });

    it('PEDAGOGO: GET /api/facturas → pasa el guard', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/facturas')
        .set('Authorization', `Bearer ${tokenPedagogo}`);

      expect(res.status).not.toBe(403);
    });
  });

  /**
   * El ADMIN también es un autónomo con su propio circuito fiscal: "Mis
   * facturas" son las suyas. La vista global es Supervisión, que llama sin el
   * flag.
   */
  describe('/api/facturas?soloMias — el ADMIN también se ve solo a sí mismo', () => {
    it('ADMIN sin soloMias: sin filtro de trabajador', async () => {
      prisma.factura.findMany.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get('/api/facturas?anio=2026')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      const call = prisma.factura.findMany.mock.calls.at(-1)![0];
      expect(call.where.trabajadorId).toBeUndefined();
    });

    it('ADMIN con soloMias=true: filtra por su propio id', async () => {
      prisma.factura.findMany.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get('/api/facturas?anio=2026&soloMias=true')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      const call = prisma.factura.findMany.mock.calls.at(-1)![0];
      expect(call.where.trabajadorId).toBe(adminUser.id);
    });

    it('ADMIN con soloMias=true en contratos: filtra por su propio id', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get('/api/contratos?soloMias=true')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      const call = prisma.contratoServicio.findMany.mock.calls.at(-1)![0];
      expect(call.where.trabajadorId).toBe(adminUser.id);
    });
  });

  // ── Generación por periodo y packs para la gestoría ──────────────────────

  /**
   * Generar era `@Roles('ADMIN')` y solo del mes en curso. Ahora cada autónomo
   * recupera los suyos de cualquier mes cerrado, y el ADMIN mantiene la palanca
   * global — pero RECEP sigue fuera de todo el bloque.
   */
  describe('POST /api/facturas/generar-mes', () => {
    it('RECEP → 403', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/facturas/generar-mes')
        .set('Authorization', `Bearer ${tokenRecep}`)
        .send({ anio: 2026, mes: 8 });

      expect(res.status).toBe(403);
    });

    it('PEDAGOGO: genera acotado a sus propios contratos, sin pedirlo', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([]);
      prisma.factura.findMany.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .post('/api/facturas/generar-mes')
        .set('Authorization', `Bearer ${tokenPedagogo}`)
        .send({ anio: 2026, mes: 8 });

      expect(res.status).toBe(201);
      const where =
        prisma.contratoServicio.findMany.mock.calls.at(-1)![0].where;
      expect(where.trabajadorId).toBe(pedagogoUser.id);
    });

    it('ADMIN sin soloMias: genera para todo el gabinete', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([]);
      prisma.factura.findMany.mockResolvedValue([]);

      await request(app.getHttpServer())
        .post('/api/facturas/generar-mes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ anio: 2026, mes: 8 });

      const where =
        prisma.contratoServicio.findMany.mock.calls.at(-1)![0].where;
      expect(where.trabajadorId).toBeUndefined();
    });

    it('un periodo futuro se rechaza con 400', async () => {
      const anioFuturo = new Date().getFullYear() + 1;

      const res = await request(app.getHttpServer())
        .post('/api/facturas/generar-mes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ anio: anioFuturo, mes: 1 });

      expect(res.status).toBe(400);
    });

    it('la previsualización no escribe nada', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([]);
      prisma.factura.findMany.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .post('/api/facturas/generar-mes/preview')
        .set('Authorization', `Bearer ${tokenPedagogo}`)
        .send({ anio: 2026, mes: 8 });

      expect(res.status).toBe(200);
      expect(prisma.factura.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/facturas/pack', () => {
    it('RECEP → 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/facturas/pack?periodoDesde=2026-07&periodoHasta=2026-09')
        .set('Authorization', `Bearer ${tokenRecep}`);

      expect(res.status).toBe(403);
    });

    it('un terapeuta no puede empaquetar las facturas de otro', async () => {
      prisma.factura.findMany.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get(
          '/api/facturas/pack/resumen?periodoDesde=2026-07&periodoHasta=2026-09',
        )
        .set('Authorization', `Bearer ${tokenPedagogo}`);

      const where = prisma.factura.findMany.mock.calls.at(-1)![0].where;
      expect(where.trabajadorId).toBe(pedagogoUser.id);
    });

    it('sin rango ni ids → 400', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/facturas/pack')
        .set('Authorization', `Bearer ${tokenPedagogo}`);

      expect(res.status).toBe(400);
    });

    /**
     * Express resuelve por orden de declaración. Con `@Get(':id')` declarado
     * antes, `GET /facturas/pack` entraba por la ruta paramétrica con
     * `id = "pack"` y el `ParseUUIDPipe` devolvía 400: descargar el paquete no
     * llegaba nunca a su controlador. Este test lo fija.
     */
    it('/pack no lo intercepta la ruta :id', async () => {
      prisma.factura.findMany.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get('/api/facturas/pack?ids=02633320-4ba7-456b-aae0-36ecaba40be7')
        .set('Authorization', `Bearer ${tokenPedagogo}`);

      // 400 por selección vacía, no por "uuid is expected" sobre la palabra "pack".
      expect(res.body.message).not.toContain('uuid');
      expect(prisma.factura.findMany).toHaveBeenCalled();
    });

    it('una sola factura seleccionada es una selección válida', async () => {
      prisma.factura.findMany.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get(
          '/api/facturas/pack/resumen?ids=02633320-4ba7-456b-aae0-36ecaba40be7',
        )
        .set('Authorization', `Bearer ${tokenPedagogo}`);

      const where = prisma.factura.findMany.mock.calls.at(-1)![0].where;
      expect(where.id).toEqual({
        in: ['02633320-4ba7-456b-aae0-36ecaba40be7'],
      });
    });

    it('un periodo mal formado → 400', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/facturas/pack?periodoDesde=julio&periodoHasta=2026-09')
        .set('Authorization', `Bearer ${tokenPedagogo}`);

      expect(res.status).toBe(400);
    });
  });

  /**
   * Entregar facturas a la gestoría saca datos personales del gabinete hacia un
   * tercero, así que el bloqueo tiene que estar en el backend y el alcance ser
   * el propio autónomo, nunca el de otro.
   */
  describe('Entrega a la gestoría', () => {
    it('RECEP: GET /api/facturas/gestoria/pendientes → 403', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/facturas/gestoria/pendientes')
        .set('Authorization', `Bearer ${tokenRecep}`);

      expect(res.status).toBe(403);
    });

    it('RECEP: POST /api/facturas/gestoria/enviar → 403', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/facturas/gestoria/enviar')
        .set('Authorization', `Bearer ${tokenRecep}`)
        .send({ periodoDesde: '2026-07', periodoHasta: '2026-09' });

      expect(res.status).toBe(403);
    });

    it('los pendientes son siempre los del que pregunta', async () => {
      prisma.factura.findMany.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get('/api/facturas/gestoria/pendientes')
        .set('Authorization', `Bearer ${tokenPedagogo}`);

      expect(res.status).toBe(200);
      const where = prisma.factura.findMany.mock.calls.at(-1)![0].where;
      expect(where.trabajadorId).toBe(pedagogoUser.id);
      expect(where.entregas).toEqual({
        none: { envio: { estado: 'ENVIADO' } },
      });
    });

    it('el historial es el propio, no el del gabinete', async () => {
      prisma.envioGestoria.findMany.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get('/api/facturas/gestoria/historial')
        .set('Authorization', `Bearer ${tokenPedagogo}`);

      const where = prisma.envioGestoria.findMany.mock.calls.at(-1)![0].where;
      expect(where.trabajadorId).toBe(pedagogoUser.id);
    });

    it('sin email de gestoría configurado no se envía nada', async () => {
      prisma.factura.findMany.mockResolvedValue([
        {
          id: 'f-1',
          periodoFacturado: '2026-07',
          estado: 'PENDIENTE',
          total: 100,
        },
      ]);
      prisma.trabajador.findUnique.mockResolvedValue({
        ...pedagogoUser,
        emailGestoria: null,
      });

      const res = await request(app.getHttpServer())
        .post('/api/facturas/gestoria/enviar')
        .set('Authorization', `Bearer ${tokenPedagogo}`)
        .send({ periodoDesde: '2026-07', periodoHasta: '2026-09' });

      expect(res.status).toBe(400);
      expect(prisma.envioGestoria.create).not.toHaveBeenCalled();
    });
  });

  // ── Sin token → 401 (verificación de JwtAuthGuard activo) ────────────────

  describe('Sin token', () => {
    it('GET /api/registros/cliente/c1 sin token → 401', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/registros/cliente/c1',
      );
      expect(res.status).toBe(401);
    });

    it('GET /api/informes/cliente/c1 sin token → 401', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/informes/cliente/c1',
      );
      expect(res.status).toBe(401);
    });
  });
});
