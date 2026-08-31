/**
 * Relaciones que hay que cargar para poder rellenar los documentos del
 * contrato. Esta aparte porque lo usan tanto `contratos` como `expediente`, y
 * los tres papeles tienen que nombrar exactamente a las mismas personas.
 */
export const CONTRATO_PDF_INCLUDE = {
  slots: { orderBy: { diaSemana: 'asc' as const } },
  trabajador: {
    select: {
      nombre: true, apellidos: true,
      nombreFiscal: true, nifFiscal: true,
      direccionFiscal: true, codigoPostalFiscal: true,
      ciudadFiscal: true, provinciaFiscal: true,
      emailFacturacion: true, email: true,
      // Datos que encabezan el contrato y los consentimientos.
      numeroColegiado: true, colegioProfesional: true,
      numeroPoliza: true, direccionProfesional: true,
    },
  },
  cliente: {
    select: {
      nombre: true, apellidos: true, dni: true,
      fechaNacimiento: true, ciudad: true, provincia: true,
      nombreTutorPagador: true, nifTutorPagador: true,
      direccionFiscalTutor: true, codigoPostalTutor: true,
      ciudadTutor: true, emailFacturacion: true,
      // Los dos progenitores que firman. `esTutorLegal` marca cuales son.
      contactosFamiliares: {
        select: {
          id: true, nombre: true, apellidos: true, dni: true,
          parentesco: true, email: true,
          esTutorLegal: true, esContactoPrincipal: true, esResponsablePago: true,
        },
      },
    },
  },
} as const;
