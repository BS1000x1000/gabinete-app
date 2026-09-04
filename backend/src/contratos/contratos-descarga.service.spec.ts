import { Test } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

import { ContratosService } from './contratos.service';
import { ContratosPdfService } from './contratos-pdf.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage/storage.service';
import { ExpedienteService } from '../expediente/expediente.service';
import { FestivosService } from '../festivos/festivos.service';

/**
 * La descarga del contrato entrega SIEMPRE una URL, nunca un binario ni una
 * redireccion.
 *
 * `:id/pdf` redirigia a la URL prefirmada cuando el contrato ya tenia firmado,
 * y el frontend lo pedia por XHR esperando un blob: la peticion seguia la
 * redireccion hasta Object Storage, otro origen y sin cabeceras CORS, asi que
 * la descarga moria. No se veia en local porque sin `SCW_*` no hay
 * `storageKeyFirmado` y esa rama no se pisa nunca.
 */

const USER = { userId: 't1', rol: 'PEDAGOGO' };
const ID = '11111111-1111-1111-1111-111111111111';

describe('ContratosService — descarga del PDF', () => {
  let service: ContratosService;
  let prisma: any;
  let storage: any;
  let pdfService: any;

  const construir = async (contrato: any, storageMock: any) => {
    prisma = { contratoServicio: { findUnique: jest.fn().mockResolvedValue(contrato) } };
    storage = storageMock;
    pdfService = { generarPdf: jest.fn().mockResolvedValue(Buffer.from('%PDF-generado')) };

    const mod = await Test.createTestingModule({
      providers: [
        ContratosService,
        { provide: PrismaService, useValue: prisma },
        { provide: ContratosPdfService, useValue: pdfService },
        { provide: StorageService, useValue: storage },
        { provide: ExpedienteService, useValue: {} },
        { provide: FestivosService, useValue: {} },
      ],
    }).compile();
    service = mod.get(ContratosService);
  };

  describe('getUrlDescargaPdf()', () => {
    it('con firmado y bucket real, devuelve la URL prefirmada', async () => {
      await construir(
        { id: ID, trabajadorId: 't1', storageKeyFirmado: 'contratos/x.pdf' },
        {
          isConfigured: true,
          sirveDesdeApi: false,
          getSignedUrl: jest.fn().mockResolvedValue('https://s3.example/firmado?sig=1'),
        },
      );

      const res = await service.getUrlDescargaPdf(ID, USER);

      expect(res.url).toBe('https://s3.example/firmado?sig=1');
      expect(res.firmado).toBe(true);
      expect(storage.getSignedUrl).toHaveBeenCalledWith('contratos/x.pdf', 300);
    });

    it('sin firmado, apunta a la API, que lo genera', async () => {
      await construir(
        { id: ID, trabajadorId: 't1', storageKeyFirmado: null },
        { isConfigured: false, sirveDesdeApi: true, getSignedUrl: jest.fn() },
      );

      const res = await service.getUrlDescargaPdf(ID, USER);

      expect(res.url).toBe(`/api/contratos/${ID}/pdf`);
      expect(res.firmado).toBe(false);
      expect(storage.getSignedUrl).not.toHaveBeenCalled();
    });

    it('en el modo local con firmado, lo sirve la API y no hay URL prefirmada', async () => {
      await construir(
        { id: ID, trabajadorId: 't1', storageKeyFirmado: 'contratos/x.pdf' },
        { isConfigured: true, sirveDesdeApi: true, getSignedUrl: jest.fn() },
      );

      const res = await service.getUrlDescargaPdf(ID, USER);

      expect(res.url).toBe(`/api/contratos/${ID}/pdf`);
      expect(res.firmado).toBe(true);
      expect(storage.getSignedUrl).not.toHaveBeenCalled();
    });

    it('respeta el acceso al contrato', async () => {
      await construir(
        { id: ID, trabajadorId: 'otro', storageKeyFirmado: null },
        { isConfigured: false, sirveDesdeApi: true },
      );

      await expect(service.getUrlDescargaPdf(ID, USER)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('getPdf()', () => {
    it('entrega el firmado cuando lo hay, no el borrador', async () => {
      await construir(
        { id: ID, trabajadorId: 't1', storageKeyFirmado: 'contratos/x.pdf' },
        {
          isConfigured: true,
          sirveDesdeApi: true,
          download: jest.fn().mockResolvedValue(Buffer.from('%PDF-firmado')),
        },
      );

      const res = await service.getPdf(ID, USER);

      expect(res.buffer.toString()).toBe('%PDF-firmado');
      expect(res.nombre).toBe(`contrato-firmado-${ID}.pdf`);
      expect(pdfService.generarPdf).not.toHaveBeenCalled();
    });

    it('genera al vuelo cuando no hay firmado', async () => {
      await construir(
        { id: ID, trabajadorId: 't1', storageKeyFirmado: null },
        { isConfigured: false, sirveDesdeApi: true, download: jest.fn() },
      );

      const res = await service.getPdf(ID, USER);

      expect(res.buffer.toString()).toBe('%PDF-generado');
      expect(res.nombre).toBe(`contrato-${ID}.pdf`);
    });

    it('falla si el firmado no esta en el almacenamiento, en vez de colar el borrador', async () => {
      await construir(
        { id: ID, trabajadorId: 't1', storageKeyFirmado: 'contratos/x.pdf' },
        { isConfigured: true, sirveDesdeApi: true, download: jest.fn().mockResolvedValue(null) },
      );

      await expect(service.getPdf(ID, USER)).rejects.toBeInstanceOf(NotFoundException);
      expect(pdfService.generarPdf).not.toHaveBeenCalled();
    });
  });
});
