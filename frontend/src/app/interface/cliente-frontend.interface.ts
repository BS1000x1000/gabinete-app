export interface ClienteData {
  nombre: string;
  apellidos: string;
  edad: number;
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
  autorizaDatosImagen: boolean;
  autorizaDatosPersonales: boolean;
  
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
  alergias?: string;
  diagnostico?: string;
  tratamientos?: string;
  medicacion?: string;
  especialistas?: string[];
  adaptaciones?: boolean; // ✅ Cambiado de string[] a boolean
  tipoAdaptaciones?: string;
  apoyos?: boolean; // ✅ NUEVO
}