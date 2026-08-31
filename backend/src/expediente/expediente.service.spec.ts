import { Test } from '@nestjs/testing';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { CategoriaDocumento, EstadoFirmaDocumento, OrigenDocumento } from '@prisma/client';
import { ExpedienteService, DOCUMENTOS_EXPEDIENTE } from './expediente.service';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentosService } from '../documentos/documentos.service';
import { PdfGeneratorService } from '../common/pdf/pdf-generator.service';
import { ContratosPdfService } from '../contratos/contratos-pdf.service';

const USER = { userId: 'trab-1', rol: 'ADMIN' };

const datosPlantilla = {
  profesional: {
    nombreCompleto: 'Belen Palacios',
    nif: '47461696-T',
    numeroColegiado: '48698',
    colegioProfesional: 'Colegio X',
    direccionProfesional: 'Calle Y',
    email: 'b@example.com',
    numeroPoliza: '2008265',
  },
  tutores: [
    { nombreCompleto: 'Madre Uno', nif: '111' },
    { nombreCompleto: 'Padre Dos', nif: '222' },
  ],
  menor: { nombreCompleto: 'Menor Test', fechaNacimiento: '01/01/2016', dni: null },
  diaSemana: 1,
  horario: '17:00 a 18:00',
  cuotaMensual: 180,
  ciudadFirma: 'Madrid',
  calendario: [],
  cursoEtiqueta: '2026-2027',
  periodoNavidad: 'los dias 24...',
  periodoSemanaSanta: 'los dias 22...',
  notas: null,
};

const contratoBase = {
  id: 'contrato-1',
  clienteId: 'cliente-1',
  slots: [{ diaSemana: 1, horaInicio: '17:00', horaFin: '18:00' }],
};

describe('ExpedienteService', () => {
  let service: ExpedienteService;
  let prisma: any;
  let documentos: any;
  let pdf: any;
  let contratosPdf: any;

  beforeEach(async () => {
    prisma = {
      contratoServicio: {
        findUnique: jest.fn().mockResolvedValue(contratoBase),
        findFirst: jest.fn().mockResolvedValue(contratoBase),
      },
      documentoCliente: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      cliente: { update: jest.fn().mockResolvedValue({}) },
      clienteTrabajador: { findFirst: jest.fn().mockResolvedValue({ id: 'ct-1' }) },
    };
    documentos = {
      create: jest.fn().mockImplementation((dto: any) => ({ id: `doc-${dto.categoria}` })),
      remove: jest.fn().mockResolvedValue(undefined),
      findByCliente: jest.fn().mockResolvedValue([]),
    };
    pdf = { generatePdf: jest.fn().mockResolvedValue(Buffer.from('%PDF-fake')) };
    contratosPdf = {
      construirDatos: jest.fn().mockResolvedValue(datosPlantilla),
      faltantes: jest.fn().mockReturnValue([]),
    };

    const mod = await Test.createTestingModule({
      providers: [
        ExpedienteService,
        { provide: PrismaService, useValue: prisma },
        { provide: DocumentosService, useValue: documentos },
        { provide: PdfGeneratorService, useValue: pdf },
        { provide: ContratosPdfService, useValue: contratosPdf },
      ],
    }).compile();

    service = mod.get(ExpedienteService);
  });

  describe('generar()', () => {
    it('produce los tres documentos del expediente', async () => {
      const res = await service.generar('contrato-1', USER);

      expect(res.generados).toBe(3);
      expect(pdf.generatePdf).toHaveBeenCalledTimes(3);

      const categorias = documentos.create.mock.calls.map((c: any[]) => c[0].categoria);
      expect(categorias).toEqual([
        CategoriaDocumento.CONTRATO,
        CategoriaDocumento.CONSENTIMIENTO_INFORMADO,
        CategoriaDocumento.CONSENTIMIENTO_DATOS,
      ]);
    });

    it('los marca como generados y guarda la version de plantilla', async () => {
      await service.generar('contrato-1', USER);

      const meta = documentos.create.mock.calls[0][3];
      expect(meta.origen).toBe(OrigenDocumento.GENERADO);
      expect(meta.estadoFirma).toBe(EstadoFirmaDocumento.GENERADO);
      expect(meta.plantillaVersion).toBe(DOCUMENTOS_EXPEDIENTE[0].version);
      expect(meta.contratoId).toBe('contrato-1');
    });

    it('NO regenera un documento ya firmado', async () => {
      prisma.documentoCliente.findMany.mockImplementation((args: any) =>
        args.where.estadoFirma === EstadoFirmaDocumento.FIRMADO
          ? [{ categoria: CategoriaDocumento.CONTRATO }]
          : [],
      );

      const res = await service.generar('contrato-1', USER);

      expect(res.generados).toBe(2);
      expect(res.omitidos).toBe(1);
      const categorias = documentos.create.mock.calls.map((c: any[]) => c[0].categoria);
      expect(categorias).not.toContain(CategoriaDocumento.CONTRATO);
    });

    it('reemplaza el generado anterior para no acumular duplicados', async () => {
      prisma.documentoCliente.findMany.mockImplementation((args: any) =>
        args.where.origen === OrigenDocumento.GENERADO ? [{ id: 'viejo-1' }] : [],
      );

      await service.generar('contrato-1', USER);

      expect(documentos.remove).toHaveBeenCalledWith('viejo-1', USER);
    });

    it('devuelve lo que falta sin dejar de generar', async () => {
      contratosPdf.faltantes.mockReturnValue(['NIF del tutor legal 2']);

      const res = await service.generar('contrato-1', USER);

      expect(res.generados).toBe(3);
      expect(res.faltantes).toEqual(['NIF del tutor legal 2']);
    });
  });

  describe('marcarEnviado()', () => {
    const docConsentimientoDatos = {
      id: 'doc-1',
      clienteId: 'cliente-1',
      categoria: CategoriaDocumento.CONSENTIMIENTO_DATOS,
      estadoFirma: EstadoFirmaDocumento.GENERADO,
    };

    it('bloquea el envio del consentimiento de datos por no estar validada la plantilla', async () => {
      prisma.documentoCliente.findUnique.mockResolvedValue(docConsentimientoDatos);

      await expect(service.marcarEnviado('doc-1', USER)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(prisma.documentoCliente.update).not.toHaveBeenCalled();
    });

    it('el motivo del bloqueo se explica en el mensaje', async () => {
      prisma.documentoCliente.findUnique.mockResolvedValue(docConsentimientoDatos);

      await expect(service.marcarEnviado('doc-1', USER)).rejects.toThrow(/dictamen/i);
    });

    it('deja enviar el contrato, cuya plantilla si esta cerrada', async () => {
      prisma.documentoCliente.findUnique.mockResolvedValue({
        id: 'doc-2',
        clienteId: 'cliente-1',
        categoria: CategoriaDocumento.CONTRATO,
        estadoFirma: EstadoFirmaDocumento.GENERADO,
      });

      await service.marcarEnviado('doc-2', USER);

      expect(prisma.documentoCliente.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ estadoFirma: EstadoFirmaDocumento.ENVIADO }),
        }),
      );
    });

    it('no reenvia algo ya firmado', async () => {
      prisma.documentoCliente.findUnique.mockResolvedValue({
        id: 'doc-3',
        clienteId: 'cliente-1',
        categoria: CategoriaDocumento.CONTRATO,
        estadoFirma: EstadoFirmaDocumento.FIRMADO,
      });

      await expect(service.marcarEnviado('doc-3', USER)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('registrarFirmado()', () => {
    const fichero = {
      originalname: 'firmado.pdf',
      mimetype: 'application/pdf',
      size: 10,
      buffer: Buffer.from('x'),
    };

    it('enlaza el firmado con el generado y marca el original', async () => {
      prisma.documentoCliente.findUnique.mockResolvedValue({
        id: 'doc-1',
        clienteId: 'cliente-1',
        categoria: CategoriaDocumento.CONTRATO,
        contratoId: 'contrato-1',
        estadoFirma: EstadoFirmaDocumento.ENVIADO,
      });

      await service.registrarFirmado('doc-1', fichero, USER);

      const meta = documentos.create.mock.calls[0][3];
      expect(meta.firmadoDeId).toBe('doc-1');
      expect(meta.estadoFirma).toBe(EstadoFirmaDocumento.FIRMADO);
      expect(prisma.documentoCliente.update).toHaveBeenCalledWith({
        where: { id: 'doc-1' },
        data: { estadoFirma: EstadoFirmaDocumento.FIRMADO },
      });
    });

    it('firmar el consentimiento de datos acredita el consentimiento RGPD del cliente', async () => {
      prisma.documentoCliente.findUnique.mockResolvedValue({
        id: 'doc-9',
        clienteId: 'cliente-1',
        categoria: CategoriaDocumento.CONSENTIMIENTO_DATOS,
        contratoId: 'contrato-1',
        estadoFirma: EstadoFirmaDocumento.GENERADO,
      });

      await service.registrarFirmado('doc-9', fichero, USER);

      expect(prisma.cliente.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cliente-1' },
          data: expect.objectContaining({ consentimientoRgpd: true }),
        }),
      );
    });

    it('firmar el contrato NO toca el consentimiento RGPD', async () => {
      prisma.documentoCliente.findUnique.mockResolvedValue({
        id: 'doc-1',
        clienteId: 'cliente-1',
        categoria: CategoriaDocumento.CONTRATO,
        contratoId: 'contrato-1',
        estadoFirma: EstadoFirmaDocumento.ENVIADO,
      });

      await service.registrarFirmado('doc-1', fichero, USER);

      expect(prisma.cliente.update).not.toHaveBeenCalled();
    });

    it('rechaza un documento ajeno al expediente', async () => {
      prisma.documentoCliente.findUnique.mockResolvedValue({
        id: 'doc-x',
        clienteId: 'cliente-1',
        categoria: CategoriaDocumento.INFORME_MEDICO,
        estadoFirma: null,
      });

      await expect(
        service.registrarFirmado('doc-x', fichero, USER),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('vistaPrevia()', () => {
    it('devuelve el PDF sin guardarlo en ninguna parte', async () => {
      const res = await service.vistaPrevia('contrato-1', CategoriaDocumento.CONTRATO, USER);

      expect(res.buffer).toBeInstanceOf(Buffer);
      expect(pdf.generatePdf).toHaveBeenCalledTimes(1);
      // Lo importante: no toca el expediente ni el almacenamiento.
      expect(documentos.create).not.toHaveBeenCalled();
      expect(documentos.remove).not.toHaveBeenCalled();
    });

    it('tambien previsualiza el consentimiento sin validar', async () => {
      const res = await service.vistaPrevia(
        'contrato-1',
        CategoriaDocumento.CONSENTIMIENTO_DATOS,
        USER,
      );

      expect(res.nombreFichero).toContain('consentimiento');
      expect(documentos.create).not.toHaveBeenCalled();
    });

    it('rechaza una categoria ajena al expediente', async () => {
      await expect(
        service.vistaPrevia('contrato-1', CategoriaDocumento.INFORME_MEDICO, USER),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('un terapeuta sin el cliente asignado no puede previsualizar', async () => {
      prisma.clienteTrabajador.findFirst.mockResolvedValue(null);

      await expect(
        service.vistaPrevia('contrato-1', CategoriaDocumento.CONTRATO, {
          userId: 'otro',
          rol: 'PEDAGOGO',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('estado()', () => {
    it('devuelve siempre las tres filas, aunque no exista ningun documento', async () => {
      const res = await service.estado('cliente-1', USER);

      expect(res.documentos).toHaveLength(3);
      expect(res.documentos.every(d => d.documentoId === null)).toBe(true);
      expect(res.puedeGenerar).toBe(true);
    });

    it('el consentimiento de datos nunca sale como enviable', async () => {
      documentos.findByCliente.mockResolvedValue([
        {
          id: 'doc-9',
          categoria: CategoriaDocumento.CONSENTIMIENTO_DATOS,
          estadoFirma: EstadoFirmaDocumento.GENERADO,
        },
      ]);

      const res = await service.estado('cliente-1', USER);
      const fila = res.documentos.find(
        d => d.categoria === CategoriaDocumento.CONSENTIMIENTO_DATOS,
      )!;

      expect(fila.documentoId).toBe('doc-9');
      expect(fila.plantillaValidada).toBe(false);
      expect(fila.puedeEnviar).toBe(false);
      expect(fila.motivoNoValidada).toMatch(/dictamen/i);
    });

    it('sin contrato no se puede generar nada', async () => {
      prisma.contratoServicio.findFirst.mockResolvedValue(null);

      const res = await service.estado('cliente-1', USER);

      expect(res.puedeGenerar).toBe(false);
      expect(res.contratoId).toBeNull();
    });
  });
});
