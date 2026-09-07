/**
 * Factory que crea un mock completo de PrismaService para tests E2E.
 * Todos los métodos devuelven valores vacíos por defecto.
 * Cada test sobrescribe los que necesite via .mockResolvedValue().
 */

const modelMock = () => ({
  findFirst: jest.fn().mockResolvedValue(null),
  findUnique: jest.fn().mockResolvedValue(null),
  findUniqueOrThrow: jest.fn().mockResolvedValue({}),
  findMany: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockResolvedValue({}),
  createMany: jest.fn().mockResolvedValue({ count: 0 }),
  update: jest.fn().mockResolvedValue({}),
  updateMany: jest.fn().mockResolvedValue({ count: 0 }),
  delete: jest.fn().mockResolvedValue({}),
  deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  count: jest.fn().mockResolvedValue(0),
  upsert: jest.fn().mockResolvedValue({}),
  aggregate: jest.fn().mockResolvedValue({}),
});

export type PrismaMock = ReturnType<typeof createPrismaMock>;

export const createPrismaMock = () => {
  const mocks = {
    trabajador: modelMock(),
    cliente: modelMock(),
    sesion: modelMock(),
    bono: modelMock(),
    notificacion: modelMock(),
    clienteTrabajador: modelMock(),
    disponibilidadClienteTrabajador: modelMock(),
    disponibilidadCliente: modelMock(),
    familiar: modelMock(),
    sanitario: modelMock(),
    informe: modelMock(),
    registroDiario: modelMock(),
    registroDiarioObjetivo: modelMock(),
    objetivo: modelMock(),
    objetivoGeneral: modelMock(),
    areaDesarrollo: modelMock(),
    clienteObjetivo: modelMock(),
    descripcionNivelGAS: modelMock(),
    evaluacionGAS: modelMock(),
    rol: modelMock(),
    colegio: modelMock(),
    tokenRevocado: modelMock(),
    auditLog: modelMock(),
    consentimientoRgpd: modelMock(),
    documentoCliente: modelMock(),
    contratoServicio: modelMock(),
    contratoSlot: modelMock(),
    factura: modelMock(),
    contadorFactura: modelMock(),
    horarioAdmin: modelMock(),
    envioGestoria: modelMock(),
    envioGestoriaFactura: modelMock(),
    // Fichaje (modelo sin schema Prisma, por si el módulo lo usa)
    fichaje: modelMock(),
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $transaction: jest.fn(),
  };

  // $transaction pasa los mismos mocks para que las aserciones funcionen
  // dentro de transacciones
  mocks.$transaction.mockImplementation(async (fnOrArray: any) => {
    if (typeof fnOrArray === 'function') {
      return fnOrArray(mocks);
    }
    return Promise.all(fnOrArray);
  });

  return mocks;
};

/**
 * Da por buena la comprobacion de acceso al cliente (`AccesoClienteService`).
 *
 * Desde que los endpoints que reciben un `clienteId` por la URL comprueban que
 * quien pide tiene ese cliente asignado, un mock vacio devuelve 404: no hay
 * cliente. Los tests que ejercitan el camino feliz declaran con esto que el
 * usuario si tiene acceso, en vez de repetir dos `mockResolvedValue` sueltos.
 */
export const permitirAccesoCliente = (prisma: PrismaMock, clienteId = 'cliente-e2e-1') => {
  prisma.cliente.findFirst.mockResolvedValue({ id: clienteId });
  prisma.clienteTrabajador.findFirst.mockResolvedValue({ id: 'ct-e2e-1' });
};
