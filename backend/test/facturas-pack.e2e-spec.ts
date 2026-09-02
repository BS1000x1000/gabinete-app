import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { MotorReglasService } from '../src/notificaciones/motor-reglas.service';
import { StorageService } from '../src/common/storage/storage.service';
import { FacturasPdfService } from '../src/facturas/facturas-pdf.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { createPrismaMock, PrismaMock } from './helpers/prisma-mock';

/**
 * Descarga de un paquete de facturas, de extremo a extremo por HTTP.
 *
 * Cubre lo que ningun test tocaba: que la ruta llegue a su controlador y que la
 * respuesta salga como binario. `GET /facturas/pack` entraba por `@Get(':id')`
 * —declarado antes— con `id = "pack"`, y el `ParseUUIDPipe` devolvia un 400.
 */

const TEST_HASH = bcrypt.hashSync('Password1', 10);

const pedagogo = {
  id: 'trabajador-e2e-1',
  username: 'pedagogo_pack',
  passwordHash: TEST_HASH,
  activo: true,
  nombre: 'María',
  apellidos: 'García',
  email: 'maria@test.es',
  rolId: 'rol-ped',
  rol: { id: 'rol-ped', nombreRol: 'Pedagogo', codigo: 'PEDAGOGO' },
  resetPasswordToken: null,
  resetPasswordExpires: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const facturaFila = {
  id: '02633320-4ba7-456b-aae0-36ecaba40be7',
  numero: 2,
  numeroFormateado: '2/2026',
  anio: 2026,
  trabajadorId: pedagogo.id,
  clienteId: 'cliente-1',
  contratoId: 'contrato-1',
  fechaEmision: new Date('2026-09-01'),
  periodoFacturado: '2026-09',
  concepto: 'Cuota mensual de pedagogia — septiembre de 2026',
  importe: 250,
  ivaPorcentaje: 0,
  ivaImporte: 0,
  retencionPorcentaje: 0,
  retencionImporte: 0,
  exencionIvaTexto: 'Exenta',
  total: 250,
  estado: 'PENDIENTE',
  fechaPago: null,
  metodoPago: null,
  urlPdfR2: 'facturas/trabajador-e2e-1/2026/2.pdf',
  emailEnviado: false,
  fechaEnvioEmail: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  trabajador: {
    ...pedagogo,
    nifFiscal: '12345678Z',
    nombreFiscal: 'María García',
  },
  cliente: {
    id: 'cliente-1',
    nombre: 'Pablo',
    apellidos: 'Martínez',
    nombreTutorPagador: 'Ana Martínez',
    nifTutorPagador: '87654321B',
  },
  contrato: { id: 'contrato-1', tipoSesion: 'PEDAGOGIA' },
};

describe('Descarga de paquetes de facturas (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaMock;
  let token: string;

  const storageStub = {
    driver: 'local',
    isConfigured: true,
    sirveDesdeApi: true,
    download: jest.fn().mockResolvedValue(Buffer.from('%PDF-falso')),
    upload: jest.fn().mockResolvedValue('clave'),
    getSignedUrl: jest.fn().mockResolvedValue(null),
    delete: jest.fn(),
  };

  // Si el pack tuviera que regenerar, este stub lo delataria.
  const pdfStub = {
    generarPdf: jest.fn().mockResolvedValue(Buffer.from('%PDF-regenerado')),
  };

  beforeAll(async () => {
    prisma = createPrismaMock();

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideProvider(MotorReglasService)
      .useValue({ evaluarReglas: jest.fn().mockResolvedValue(undefined) })
      .overrideProvider(StorageService)
      .useValue(storageStub)
      .overrideProvider(FacturasPdfService)
      .useValue(pdfStub)
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    prisma.trabajador.findFirst.mockResolvedValue(pedagogo);
    prisma.trabajador.findUnique.mockResolvedValue(pedagogo);
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: pedagogo.username, password: 'Password1' });
    const setCookie = (login.headers['set-cookie'] as unknown as string[])[0];
    token = setCookie.split(';')[0].split('=').slice(1).join('=');
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.factura.findMany.mockResolvedValue([facturaFila]);
    storageStub.download.mockResolvedValue(Buffer.from('%PDF-falso'));
  });

  it('una sola factura seleccionada devuelve un zip', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/facturas/pack?ids=${facturaFila.id}&formato=zip`)
      .set('Authorization', `Bearer ${token}`)
      .buffer(true)
      .parse((r, cb) => {
        const trozos: Buffer[] = [];
        r.on('data', (t: Buffer) => trozos.push(t));
        r.on('end', () => cb(null, Buffer.concat(trozos)));
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/zip');
    expect(res.headers['content-disposition']).toContain(
      'facturas_12345678Z_2026-09.zip',
    );
    expect(res.headers['x-pack-incidencias']).toBe('0');
    // Firma local de un fichero zip.
    expect((res.body as Buffer).subarray(0, 2).toString()).toBe('PK');
  });

  it('lee el PDF archivado en vez de relanzar Puppeteer', async () => {
    await request(app.getHttpServer())
      .get(`/api/facturas/pack?ids=${facturaFila.id}`)
      .set('Authorization', `Bearer ${token}`)
      .buffer(true)
      .parse(
        (r, cb) =>
          r.on('data', () => {}) &&
          r.on('end', () => cb(null, Buffer.alloc(0))),
      );

    expect(storageStub.download).toHaveBeenCalledWith(
      'facturas/trabajador-e2e-1/2026/2.pdf',
    );
    expect(pdfStub.generarPdf).not.toHaveBeenCalled();
  });

  it('formato=excel devuelve solo el libro', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/facturas/pack?ids=${facturaFila.id}&formato=excel`)
      .set('Authorization', `Bearer ${token}`)
      .buffer(true)
      .parse((r, cb) => {
        const trozos: Buffer[] = [];
        r.on('data', (t: Buffer) => trozos.push(t));
        r.on('end', () => cb(null, Buffer.concat(trozos)));
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('spreadsheetml');
    expect(res.headers['content-disposition']).toContain(
      'resumen-facturas_2026-09.xlsx',
    );
    expect(storageStub.download).not.toHaveBeenCalled();
  });

  it('el resumen enseña los nombres de fichero antes de descargar nada', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/facturas/pack/resumen?ids=${facturaFila.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.numFacturas).toBe(1);
    expect(res.body.data.ficheros).toEqual([
      'resumen-facturas_2026-09.xlsx',
      '0002_2026-09_Ana-Martínez.pdf',
    ]);
  });
});
