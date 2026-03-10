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
  whatsapp?: boolean;
}

interface SanitarioBackend {
  id: string;
  centroSalud?: string;
  alergias?: string;
  medicacion?: string;
  diagnostico?: string;
  tratamientos?: string;
  especialistas?: string[];
  adaptaciones?: boolean;
  tipoAdaptaciones?: string;
  apoyos?: boolean;
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
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}