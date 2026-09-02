import { Test } from '@nestjs/testing';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { CategoriaDocumento, EstadoFirmaDocumento, OrigenDocumento } from '@prisma/client';
import { ExpedienteService, DOCUMENTOS_EXPEDIENTE } from './expediente.service';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentosService } from '../documentos/documentos.service';
import { PdfGeneratorService } from '../common/pdf/pdf-generator.service';
import { ContratosPdfService } from '../contratos/contratos-pdf.service';
import { ConsentimientosService } from '../consentimientos/consentimientos.service';

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
  let consentimientos: any;

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
    consentimientos = {
      registrar: jest.fn().mockResolvedValue({ id: 'cons-1' }),
      assertTutoresLegales: jest.fn().mockResolvedValue(['fam-1']),
    };

    const mod = await Test.createTestingModule({
      providers: [
        ExpedienteService,
        { provide: PrismaService, useValue: prisma },
        { provide: DocumentosService, useValue: documentos },
        { provide: PdfGeneratorService, useValue: pdf },
        { provide: ContratosPdfService, useValue: contratosPdf },
        { provide: ConsentimientosService, useValue: consentimientos },
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

    /** Desde 2026-09-02 la plantilla esta cerrada: base legal 9.2.a y encargados. */
    it('deja enviar el consentimiento de datos, ya con la plantilla cerrada', async () => {
      prisma.documentoCliente.findUnique.mockResolvedValue(docConsentimientoDatos);

      await service.marcarEnviado('doc-1', USER);

      expect(prisma.documentoCliente.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ estadoFirma: EstadoFirmaDocumento.ENVIADO }),
        }),
      );
    });

    /**
     * El interruptor sigue siendo la garantia: si la consultora objeta algo, basta
     * con poner `PLANTILLA_VALIDADA` a false para que el documento deje de salir.
     * Se prueba el mecanismo, no el valor que tenga hoy la constante.
     */
    it('una plantilla sin validar no se puede enviar', async () => {
      const def: any = DOCUMENTOS_EXPEDIENTE.find(
        d => d.categoria === CategoriaDocumento.CONSENTIMIENTO_DATOS,
      );
      const validadaOriginal = def.validada;
      def.validada = false;
      prisma.documentoCliente.findUnique.mockResolvedValue(docConsentimientoDatos);

      try {
        await expect(service.marcarEnviado('doc-1', USER)).rejects.toBeInstanceOf(
          ForbiddenException,
        );
        expect(prisma.documentoCliente.update).not.toHaveBeenCalled();
      } finally {
        def.validada = validadaOriginal;
      }
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

    const datosFirma = {
      firmanteIds: ['fam-1', 'fam-2'],
      autorizaInformesTerceros: true,
      autorizaCoordinacionCentro: false,
      autorizaImagenes: true,
      consentimientoMenor14: false,
    };

    const mockConsentimientoDatos = () =>
      prisma.documentoCliente.findUnique.mockResolvedValue({
        id: 'doc-9',
        clienteId: 'cliente-1',
        categoria: CategoriaDocumento.CONSENTIMIENTO_DATOS,
        contratoId: 'contrato-1',
        estadoFirma: EstadoFirmaDocumento.GENERADO,
      });

    it('firmar el consentimiento de datos lo registra con su evidencia y sus alcances', async () => {
      mockConsentimientoDatos();

      await service.registrarFirmado('doc-9', fichero, USER, datosFirma);

      const definicion = DOCUMENTOS_EXPEDIENTE.find(
        d => d.categoria === CategoriaDocumento.CONSENTIMIENTO_DATOS,
      )!;

      expect(consentimientos.registrar).toHaveBeenCalledWith(
        'cliente-1',
        expect.objectContaining({
          firmanteIds: ['fam-1', 'fam-2'],
          // La version es la de la plantilla que la familia leyo, no una constante suelta.
          versionTexto: definicion.version,
          // El PDF firmado es lo que acredita el consentimiento.
          documentoId: 'doc-CONSENTIMIENTO_DATOS',
          autorizaInformesTerceros: true,
          autorizaCoordinacionCentro: false,
          autorizaImagenes: true,
          consentimientoMenor14: false,
        }),
        USER,
      );
    });

    it('sin tutor legal no sube nada: el PDF no llega al bucket', async () => {
      mockConsentimientoDatos();

      await expect(
        service.registrarFirmado('doc-9', fichero, USER, {}),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(documentos.create).not.toHaveBeenCalled();
      expect(consentimientos.registrar).not.toHaveBeenCalled();
    });

    it('si alguno de los firmantes no es tutor legal, tampoco sube nada', async () => {
      mockConsentimientoDatos();
      consentimientos.assertTutoresLegales.mockRejectedValueOnce(
        new BadRequestException('no es tutor legal'),
      );

      await expect(
        service.registrarFirmado('doc-9', fichero, USER, datosFirma),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(documentos.create).not.toHaveBeenCalled();
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

      expect(consentimientos.registrar).not.toHaveBeenCalled();
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

    it('el consentimiento de datos ya sale como enviable', async () => {
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
      expect(fila.plantillaValidada).toBe(true);
      expect(fila.puedeEnviar).toBe(true);
    });

    it('sin contrato no se puede generar nada', async () => {
      prisma.contratoServicio.findFirst.mockResolvedValue(null);

      const res = await service.estado('cliente-1', USER);

      expect(res.puedeGenerar).toBe(false);
      expect(res.contratoId).toBeNull();
    });
  });
});
