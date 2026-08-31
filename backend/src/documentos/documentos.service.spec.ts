import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DocumentosService, TAMANO_MAX_BYTES } from './documentos.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage/storage.service';
import { FicheroSubido } from './dto/documento.dto';

// ── Mock helpers ──────────────────────────────────────────────────────────────

const mkPrisma = () => ({
  cliente:            { findUnique: jest.fn() },
  clienteTrabajador:  { findFirst: jest.fn() },
  documentoCliente:   {
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

const mkStorage = (configured = true) => ({
  isConfigured: configured,
  upload: jest.fn().mockResolvedValue('key'),
  getSignedUrl: jest.fn().mockResolvedValue('https://signed.example/doc.pdf'),
  delete: jest.fn().mockResolvedValue(undefined),
});

const mkFichero = (over: Partial<FicheroSubido> = {}): FicheroSubido => ({
  originalname: 'informe.pdf',
  mimetype: 'application/pdf',
  size: 1024,
  buffer: Buffer.from('x'),
  ...over,
});

const dtoBase = { clienteId: 'c1', categoria: 'INFORME_MEDICO' as const };

const userAdmin    = { userId: 'admin-1',    rol: 'ADMIN'    };
const userPedagogo = { userId: 'terapeuta-1', rol: 'PEDAGOGO' };

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('DocumentosService', () => {
  let svc: DocumentosService;
  let prisma: ReturnType<typeof mkPrisma>;
  let storage: ReturnType<typeof mkStorage>;

  const build = async (storageMock = mkStorage()) => {
    prisma = mkPrisma();
    storage = storageMock;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentosService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();
    svc = module.get(DocumentosService);
  };

  beforeEach(async () => {
    await build();
    prisma.cliente.findUnique.mockResolvedValue({ id: 'c1' });
    prisma.documentoCliente.create.mockResolvedValue({ id: 'doc-1' });
  });

  // ── create ──────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('sube el fichero y persiste los metadatos', async () => {
      await svc.create(dtoBase, mkFichero(), userAdmin);

      expect(storage.upload).toHaveBeenCalledTimes(1);
      const [key, , contentType] = storage.upload.mock.calls[0];
      expect(key).toMatch(/^clientes\/c1\/documentos\/[0-9a-f-]{36}\.pdf$/);
      expect(contentType).toBe('application/pdf');
      expect(prisma.documentoCliente.create).toHaveBeenCalledTimes(1);
    });

    it('nunca mete el nombre original del fichero en la clave de Storage', async () => {
      await svc.create(dtoBase, mkFichero({ originalname: 'Ana Garcia diagnostico.pdf' }), userAdmin);

      const [key] = storage.upload.mock.calls[0];
      expect(key).not.toContain('Ana');
      expect(key).not.toContain('diagnostico');
    });

    it('rechaza tipos de fichero no permitidos', async () => {
      await expect(
        svc.create(dtoBase, mkFichero({ mimetype: 'application/x-msdownload' }), userAdmin),
      ).rejects.toThrow(BadRequestException);
      expect(storage.upload).not.toHaveBeenCalled();
    });

    it('rechaza ficheros que superan el tamaño máximo', async () => {
      await expect(
        svc.create(dtoBase, mkFichero({ size: TAMANO_MAX_BYTES + 1 }), userAdmin),
      ).rejects.toThrow(BadRequestException);
      expect(storage.upload).not.toHaveBeenCalled();
    });

    it('falla de forma visible si Object Storage no está configurado', async () => {
      await build(mkStorage(false));
      prisma.cliente.findUnique.mockResolvedValue({ id: 'c1' });

      await expect(svc.create(dtoBase, mkFichero(), userAdmin)).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('borra el objeto huérfano si falla el guardado en BD', async () => {
      prisma.documentoCliente.create.mockRejectedValue(new Error('db caída'));

      await expect(svc.create(dtoBase, mkFichero(), userAdmin)).rejects.toThrow('db caída');
      expect(storage.delete).toHaveBeenCalledTimes(1);
    });

    it('impide subir a un cliente no asignado al terapeuta', async () => {
      prisma.clienteTrabajador.findFirst.mockResolvedValue(null);

      await expect(svc.create(dtoBase, mkFichero(), userPedagogo)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ── findByCliente ───────────────────────────────────────────────────────────

  describe('findByCliente()', () => {
    it('lanza NotFoundException si el cliente no existe', async () => {
      prisma.cliente.findUnique.mockResolvedValue(null);

      await expect(svc.findByCliente('nope', userAdmin)).rejects.toThrow(NotFoundException);
    });

    it('un terapeuta asignado sí accede', async () => {
      prisma.clienteTrabajador.findFirst.mockResolvedValue({ id: 'ct-1' });

      await expect(svc.findByCliente('c1', userPedagogo)).resolves.toEqual([]);
    });
  });

  // ── remove ──────────────────────────────────────────────────────────────────

  describe('remove()', () => {
    beforeEach(() => {
      prisma.documentoCliente.findUnique.mockResolvedValue({
        id: 'doc-1',
        clienteId: 'c1',
        storageKey: 'clientes/c1/documentos/abc.pdf',
        subidoPorId: 'otro-terapeuta',
      });
    });

    it('ADMIN puede eliminar cualquier documento', async () => {
      await expect(svc.remove('doc-1', userAdmin)).resolves.toEqual({ id: 'doc-1', eliminado: true });
      expect(storage.delete).toHaveBeenCalledWith('clientes/c1/documentos/abc.pdf');
    });

    it('un terapeuta no puede eliminar un documento que no subió', async () => {
      prisma.clienteTrabajador.findFirst.mockResolvedValue({ id: 'ct-1' });

      await expect(svc.remove('doc-1', userPedagogo)).rejects.toThrow(ForbiddenException);
      expect(prisma.documentoCliente.delete).not.toHaveBeenCalled();
    });
  });
});
