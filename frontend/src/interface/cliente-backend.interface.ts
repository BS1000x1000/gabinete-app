// Define la estructura para el objeto 'colegio' anidado
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

// Define la estructura para los objetos dentro de 'contactosFamiliares'
interface FamiliarBackend {
  id: string;
  nombreContacto: string;
  parentesco: string;
  nombreMadre?: string;
  telefonoMadre?: string; // El backend de JS/Prisma los devuelve como string
  emailMadre?: string;
  dniMadre?: string;
  nombrePadre?: string;
  telefonoPadre?: string; // El backend de JS/Prisma los devuelve como string
  emailPadre?: string;
  dniPadre?: string;
}

// Interfaz Sanitario (asumo que es una relación y tomamos el primer elemento del array)
interface SanitarioBackend {
  id: string;
  centroSalud?: string;
  alergias?: string;
  medicacion?: string;
  diagnostico?: string;
  tratamientos?: string;
  especialistas?: string[];
  adaptaciones?: string[];
  tipoAdaptaciones?: string;
}

/**
 * Interfaz que representa la estructura exacta de la respuesta JSON
 * que se recibe del endpoint GET /clientes/:id, incluyendo las relaciones anidadas.
 */
export interface ClienteDataBackend {
  // Campos de Cliente a nivel raíz
  id: string;
  idCarpetaDrive: string | null;
  nombre: string;
  apellidos: string;
  fechaNacimiento: Date;
  dni: string;
  domicilio: string;
  provincia: string;
  ciudad: string;
  curso: string; // Mapea a cursoEscolar en el frontend
  fechaInicio: Date;
  fechaAlta: Date;
  activo: boolean;
  numeroDeSesiones?: string;

  // Relaciones anidadas (como vienen de la API de tu JSON)
  colegioId: string;
  colegio: ColegioBackend;
  contactosFamiliares: FamiliarBackend[];

  // **NOTA:** Asumimos que Sanitario viene en una relación anidada.
  sanitario?: SanitarioBackend[];

  // Si los campos sanitarios se mantienen en la raíz (ej: alergias), debes añadirlos aquí.
}
