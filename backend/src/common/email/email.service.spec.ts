import * as nodemailer from 'nodemailer';
import type { SendMailOptions } from 'nodemailer';
import { EmailService, FacturaEmailPayload } from './email.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

const createTransportMock = nodemailer.createTransport as unknown as jest.Mock;

/** Resultado de `sendMail` con todo aceptado, que es el caso feliz de SMTP. */
function infoOk(destinatario = 'familia@example.com') {
  return {
    accepted: [destinatario],
    rejected: [],
    pending: [],
    response: '250 Ok: queued as ABC123',
    messageId: '<id@tem>',
    envelope: { from: 'facturacion@gabinete.es', to: [destinatario] },
  };
}

function payloadFactura(
  overrides: Partial<FacturaEmailPayload> = {},
): FacturaEmailPayload {
  return {
    to: 'familia@example.com',
    replyTo: 'belen@gabinete.es',
    nombreTrabajador: 'Belén',
    numeroFormateado: '0012/2026',
    periodoFacturado: '2026-07',
    concepto: 'Servicios profesionales',
    total: '180,00',
    pdfBuffer: Buffer.alloc(1024),
    pdfFilename: '0012_2026-07_Tutor-Pagador.pdf',
    ...overrides,
  };
}

describe('EmailService', () => {
  const ENV_ORIGINAL = process.env;
  let sendMail: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ENV_ORIGINAL };
    sendMail = jest.fn().mockResolvedValue(infoOk());
    createTransportMock.mockReturnValue({ sendMail });
  });

  afterAll(() => {
    process.env = ENV_ORIGINAL;
  });

  /** Servicio con credenciales de TEM puestas. */
  function servicioConfigurado(): EmailService {
    process.env.SCW_TEM_PROJECT_ID = 'proyecto-abc';
    process.env.SCW_TEM_SECRET_KEY = 'clave-secreta';
    process.env.EMAIL_FROM = 'facturacion@gabinete.es';
    return new EmailService();
  }

  describe('modo no-op (sin credenciales)', () => {
    beforeEach(() => {
      delete process.env.SCW_TEM_PROJECT_ID;
      delete process.env.SCW_TEM_SECRET_KEY;
    });

    it('arranca sin reventar y se declara no configurado', () => {
      // TEM exige dominio verificado y todavia no hay dominio: la app tiene que
      // poder arrancar igual.
      const service = new EmailService();

      expect(service.isConfigured).toBe(false);
      expect(createTransportMock).not.toHaveBeenCalled();
    });

    it('devuelve false y no intenta enviar nada', async () => {
      const service = new EmailService();

      await expect(service.sendFacturaEmail(payloadFactura())).resolves.toBe(
        false,
      );
      expect(sendMail).not.toHaveBeenCalled();
    });

    it('sigue en no-op si solo esta la mitad de las credenciales', () => {
      process.env.SCW_TEM_PROJECT_ID = 'proyecto-abc';

      expect(new EmailService().isConfigured).toBe(false);
    });
  });

  describe('configuracion del transporte SMTP', () => {
    it('apunta a Scaleway TEM con TLS implicito por defecto', () => {
      const service = servicioConfigurado();

      expect(service.isConfigured).toBe(true);
      expect(createTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'smtp.tem.scaleway.com',
          port: 465,
          secure: true,
          auth: { user: 'proyecto-abc', pass: 'clave-secreta' },
        }),
      );
    });

    it('exige STARTTLS en los puertos que no son TLS implicito', () => {
      process.env.SCW_TEM_PORT = '587';
      servicioConfigurado();

      expect(createTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({ port: 587, secure: false, requireTLS: true }),
      );
    });

    it('cae a no-op si el puerto no es un numero', () => {
      process.env.SCW_TEM_PORT = 'cuatrocientos';

      expect(servicioConfigurado().isConfigured).toBe(false);
    });
  });

  describe('envio correcto', () => {
    it('devuelve true y manda el PDF como adjunto', async () => {
      const service = servicioConfigurado();

      await expect(service.sendFacturaEmail(payloadFactura())).resolves.toBe(
        true,
      );

      const llamadas = sendMail.mock.calls as SendMailOptions[][];
      const mensaje = llamadas[0][0];
      expect(mensaje.to).toBe('familia@example.com');
      expect(mensaje.replyTo).toBe('belen@gabinete.es');
      expect(mensaje.from).toBe('facturacion@gabinete.es');
      expect(mensaje.attachments).toEqual([
        {
          filename: '0012_2026-07_Tutor-Pagador.pdf',
          content: expect.any(Buffer) as Buffer,
        },
      ]);
    });
  });

  describe('rechazo del servidor sin excepcion', () => {
    // Quien llama marca `emailEnviado: true` con este booleano. Una factura
    // marcada como enviada que nunca salio no se reintenta jamas.
    it('devuelve false si el destinatario aparece en `rejected`', async () => {
      sendMail.mockResolvedValue({
        ...infoOk(),
        accepted: [],
        rejected: ['familia@example.com'],
        response: '550 5.1.1 User unknown',
      });
      const service = servicioConfigurado();

      await expect(service.sendFacturaEmail(payloadFactura())).resolves.toBe(
        false,
      );
    });

    it('devuelve false si el destinatario queda en `pending` (fallo temporal)', async () => {
      sendMail.mockResolvedValue({
        ...infoOk(),
        accepted: [],
        pending: ['familia@example.com'],
        response: '451 4.3.0 Try again later',
      });
      const service = servicioConfigurado();

      await expect(service.sendFacturaEmail(payloadFactura())).resolves.toBe(
        false,
      );
    });

    it('devuelve false si no hay ningun destinatario aceptado', async () => {
      sendMail.mockResolvedValue({ ...infoOk(), accepted: [] });
      const service = servicioConfigurado();

      await expect(service.sendFacturaEmail(payloadFactura())).resolves.toBe(
        false,
      );
    });

    it('devuelve false si la respuesta final de SMTP no es 2xx', async () => {
      sendMail.mockResolvedValue({
        ...infoOk(),
        response: '451 4.7.1 Greylisted',
      });
      const service = servicioConfigurado();

      await expect(service.sendFacturaEmail(payloadFactura())).resolves.toBe(
        false,
      );
    });

    it('devuelve false si `sendMail` lanza', async () => {
      sendMail.mockRejectedValue(new Error('ECONNREFUSED'));
      const service = servicioConfigurado();

      await expect(service.sendFacturaEmail(payloadFactura())).resolves.toBe(
        false,
      );
    });
  });

  describe('tope de adjuntos', () => {
    const DEMASIADO = Buffer.alloc(26 * 1024 * 1024);

    it('no envia una factura cuyo PDF pasa del limite', async () => {
      const service = servicioConfigurado();

      await expect(
        service.sendFacturaEmail(payloadFactura({ pdfBuffer: DEMASIADO })),
      ).resolves.toBe(false);
      expect(sendMail).not.toHaveBeenCalled();
    });

    it('no envia un pack de gestoria pasado de tamano', async () => {
      const service = servicioConfigurado();

      await expect(
        service.sendPackGestoriaEmail({
          to: 'gestoria@example.com',
          replyTo: 'belen@gabinete.es',
          nombreTrabajador: 'Belén',
          nifTrabajador: '12345678Z',
          periodo: '3T 2026',
          numFacturas: 12,
          totalImporte: 2160,
          ficheros: ['resumen-facturas_2026-07.xlsx'],
          adjuntos: [{ filename: 'pack.zip', content: DEMASIADO }],
        }),
      ).resolves.toBe(false);
      expect(sendMail).not.toHaveBeenCalled();
    });

    it('tampoco envia un expediente pasado de tamano', async () => {
      // El expediente lleva datos de un menor y nunca tuvo esta comprobacion.
      const service = servicioConfigurado();

      await expect(
        service.sendExpedienteEmail({
          to: 'familia@example.com',
          replyTo: 'belen@gabinete.es',
          nombreTrabajador: 'Belén',
          nombreMenor: 'Menor de prueba',
          documentos: ['Contrato'],
          adjuntos: [{ filename: 'contrato.pdf', content: DEMASIADO }],
        }),
      ).resolves.toBe(false);
      expect(sendMail).not.toHaveBeenCalled();
    });

    it('sí envia justo por debajo del limite', async () => {
      const service = servicioConfigurado();

      await expect(
        service.sendFacturaEmail(
          payloadFactura({ pdfBuffer: Buffer.alloc(24 * 1024 * 1024) }),
        ),
      ).resolves.toBe(true);
      expect(sendMail).toHaveBeenCalledTimes(1);
    });
  });
});
