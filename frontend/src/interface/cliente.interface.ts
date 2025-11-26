export interface ClienteData {
  nombre: string;
  apellidos: string;
  fechaNacimiento: Date; // Usamos Date, aunque se serializará a string ISO en el envío
  alergias?: string;

  // Datos del Colegio
  nombreDelCentro: string;
  cursoEscolar: string;
  direccionColegio: string;

  // Contacto Familiar (Padre)
  nombrePadre?: string;
  emailPadre?: string;
  telefonoPadre?: number; // Se enviará como número

  // Contacto Familiar (Madre)
  nombreMadre?: string;
  emailMadre?: string;
  telefonoMadre?: number; // Se enviará como número

  // Otro Contacto
  otroContactoNombre?: string;
  otroContactoEmail?: string;
  otroContactoTelefono?: number; // Se enviará como número

  // Contactos del Colegio (Campos planos)
  ctoColegioUno?: string; 
  ctoEmailColegioUno?: string; 
  ctoRelacionColegioUno?: string; 
  ctoColegioDos?: string;
  ctoRelacionColegioDos: string; // Este campo parece ser requerido según tu DTO
  ctoEmailColegioDos?: string;

  // Otros datos del cliente
  domicilio: string;
  diagnostico?: string;
  otrosTratamientos?: string;
  medicacion?: string;

  // Campos de Apoyos/Adaptaciones
  adaptaciones?: string[]; 
  tipoAdaptaciones?: string; // Asumo que esto es para describir el tipo de adaptaciones
  numeroDeSesiones?: string[]; // Asumo que se envían como array de strings (aunque el backend espera un booleano para 'apoyos')
}