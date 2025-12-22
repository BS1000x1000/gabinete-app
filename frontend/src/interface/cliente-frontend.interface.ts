export interface ClienteData {
  nombre: string;
  apellidos: string;
  edad: number;
  dni: string;
  movil?: string;
  email?: string;
  fechaNacimiento: Date; // Usamos Date, aunque se serializará a string ISO en el envío
  domicilio: string;
  provincia: string;
  ciudad: string;
  numeroDeSesiones?: string; // Asumo que se envían como array de strings (aunque el backend espera un booleano para 'apoyos')
  fechaAlta: Date;
  fechaInicio: Date;
  autorizaDatosImagen: boolean;
  autorizaDatosPersonales: boolean;
}

// ** 1. DEFINICIÓN DE INTERFACES GRANULARES **
// Esto asegura que cada Signal tenga un tipo estricto y solo contenga lo necesario.

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
  // Si tienes otros campos de Colegio, irían aquí.
}

export interface SanitarioData {
  centroSalud: string;
  alergias?: string;
  diagnostico?: string;
  tratamientos?: string;
  medicacion?: string;
  especialistas?: string[];
  adaptaciones?: string[];
  tipoAdaptaciones?: string;
}
