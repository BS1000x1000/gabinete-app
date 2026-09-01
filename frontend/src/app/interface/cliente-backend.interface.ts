// ========================================
// INTERFACES AUXILIARES
// ========================================

interface ColegioBackend {
  id: string;
  nombre: string;
  direccionColegio: string;
  ctoColegioUno: string;
  ctoEmailColegioUno?: string;
  ctoTelefonoUno: string;
  ctoColegioDos?: string;
  ctoRelacionColegioUno?: string;
  ctoTelefonoDos?: string;
  ctoEmailColegioDos?: string;
  ctoRelacionColegioDos?: string;
}

interface FamiliarBackend {
  id: string;
  nombre: string;
  apellidos: string;
  parentesco: string;
  telefono: string;
  email?: string;
  dni?: string;
  esResponsablePago?: boolean;
  esContactoPrincipal?: boolean;
  esTutorLegal?: boolean;
  whatsapp?: boolean;
}

interface SanitarioBackend {
  id: string;
  centroSalud?: string;
  diagnostico?: string;
  tratamientos?: string;
  /** Profesionales sanitarios EXTERNOS (psicologo, logopeda, neuropediatra...). */
  especialistas?: string[];
}

/** Situacion escolar DEL NINO. Separado de Colegio, que se comparte entre clientes. */
interface EscolarBackend {
  id: string;
  adaptaciones?: boolean;
  tipoAdaptaciones?: string;
  apoyos?: boolean;
  /** Especialistas del CENTRO (PT, AL, orientador...). */
  especialistas?: string[];
}

// ✅ NUEVO: Objetivo General Asignado
interface ObjetivoGeneralAsignado {
  id: string;
  fechaAsignacion: string;
  activo: boolean;
  objetivoGeneral: {
    id: string;
    titulo: string;
    descripcion?: string;
    areaDesarrollo: {
      id: string;
      nombre: string;
      color?: string;
      orden: number;
    };
  };
}

/**
 * Un hecho del historico de consentimiento: se otorgo o se revoco.
 * `documento` es el PDF firmado que lo acredita.
 */
export interface ConsentimientoRgpdBackend {
  id: string;
  aceptado: boolean;
  /** Version de la plantilla que la familia firmo. */
  versionTexto: string;
  fechaRegistro: string;
  /** La fecha escrita en el papel, si se conoce. */
  fechaFirma?: string | null;
  /** Motivo de la revocacion, o por que se registro fuera del expediente. */
  motivoRegistroManual?: string | null;

  /** Las tres casillas del documento, mas el consentimiento del propio menor. */
  autorizaInformesTerceros: boolean;
  autorizaCoordinacionCentro: boolean;
  autorizaImagenes: boolean;
  consentimientoMenor14: boolean;

  documentoId?: string | null;
  documento?: { id: string; nombre: string; mimeType: string } | null;

  /**
   * Quien firmo. Son varios porque con dos titulares de la patria potestad lo
   * normal es que firmen ambos.
   */
  firmantes: Array<{
    familiar: {
      id: string;
      nombre: string;
      apellidos: string;
      parentesco: string;
    };
  }>;
  trabajador: {
    id: string;
    nombre: string;
    apellidos: string;
  };
}

// ========================================
// INTERFAZ PRINCIPAL
// ========================================

/**
 * Interfaz que representa la estructura completa del cliente
 * desde el endpoint GET /clientes/:id del backend
 */
export interface ClienteDataBackend {
  // Campos básicos
  id: string;
  idCarpetaDrive: string | null;
  nombre: string;
  apellidos: string;
  fechaNacimiento: string; // ISO string
  dni: string;
  domicilio: string;
  provincia: string;
  ciudad: string;
  curso: string;
  fechaInicio?: string;
  fechaAlta: string;
  activo: boolean;
  consentimientoRgpd: boolean;
  consentimientoFecha?: string | null;
  
  // Relación con colegio
  colegioId?: string | null;
  colegio?: ColegioBackend | null;
  
  // Contactos familiares
  contactosFamiliares: FamiliarBackend[];
  
  // Datos sanitarios
  sanitario?: SanitarioBackend | null;

  // Situacion escolar del nino
  escolar?: EscolarBackend | null;
  
  // ✅ NUEVO: Objetivos generales asignados
  objetivosGeneralesAsignados: ObjetivoGeneralAsignado[];
  
  // Relaciones con trabajadores
  trabajadoresAsignados?: {
    trabajador: {
      id: string;
      nombre: string;
      apellidos: string;
      email: string;
    };
    tipoTerapia?: string;
    createdAt: string;
  }[];
  
  // Disponibilidad (horarios semanales)
  disponibilidad?: {
    id: string;
    diaSemana: number; // 0-6
    horaInicio: string; // "17:00"
    horaFin: string; // "18:00"
  }[];
  
  // Datos del pagador/tutor para facturación (Hito R)
  nifTutorPagador?: string | null;
  nombreTutorPagador?: string | null;
  direccionFiscalTutor?: string | null;
  codigoPostalTutor?: string | null;
  ciudadTutor?: string | null;
  emailFacturacion?: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}