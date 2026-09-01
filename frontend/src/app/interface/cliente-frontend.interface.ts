export interface ClienteData {
  nombre: string;
  apellidos: string;
  edad: number;
  edadTexto?: string;
  curso: string;
  dni: string;
  movil?: string;
  email?: string;
  fechaNacimiento: Date;
  domicilio: string;
  provincia: string;
  ciudad: string;
  numeroDeSesiones?: string;
  fechaAlta: Date;
  fechaInicio: Date;
  // Los permisos concretos (imagenes, coordinacion con el centro, informes de
  // terceros) NO viven aqui: son alcances del consentimiento firmado y se leen
  // del historico, en el panel RGPD del perfil. Tenerlos aqui derivados de un
  // unico booleano era decir que se autoriza lo que no se ha autorizado.
  
  // ✅ NUEVO: Objetivos generales asignados (resumen)
  objetivosResumen?: {
    total: number;
    activos: number;
  };
}

export interface ContactosData {
  nombrePadre?: string;
  emailPadre?: string;
  dniPadre?: string;
  telefonoPadre?: number;
  nombreMadre?: string;
  emailMadre?: string;
  dniMadre?: string;
  telefonoMadre?: number;
  otroContactoNombre?: string;
  otroContactoEmail?: string;
  otroContactoTelefono?: number;
}

export interface ColegioData {
  nombreDelCentro: string;
  cursoEscolar: string;
  direccionColegio: string;
  ctoColegioUno?: string;
  ctoTelefonoUno: string;
  ctoEmailColegioUno?: string;
  ctoRelacionColegioUno?: string;
  ctoColegioDos?: string;
  ctoTelefonoDos?: string;
  ctoRelacionColegioDos: string;
  ctoEmailColegioDos?: string;
}

export interface SanitarioData {
  centroSalud: string;
  diagnostico?: string;
  tratamientos?: string;
  /** Profesionales sanitarios externos (psicólogo, logopeda, neuropediatra...). */
  especialistas?: string[];
}

/**
 * Situación escolar del alumno. Vive aparte de `ColegioData` porque el colegio es
 * una entidad compartida entre clientes y esto es del niño concreto.
 */
export interface EscolarData {
  adaptaciones?: boolean;
  tipoAdaptaciones?: string;
  apoyos?: boolean;
  /** Especialistas del centro escolar (PT, AL, orientador...). */
  especialistas?: string[];
}