// interfaces/cliente.interface.ts
export interface Cliente {
  id: number;
  nombre: string;
  apellidos: string;
  fechaNacimiento: Date;
  domicilio: string;
  curso: string;
  // Sanitario (profesionales externos aparte, ver modelo Sanitario)
  diagnostico: string | null;
  tratamientos: string | null;
  // Escolar — situación del alumno, no del centro (ver modelo Escolar)
  adaptaciones: boolean;
  apoyos: boolean;
  colegio?: {
    id: number;
    nombre: string;
    direccionColegio: string;
  };
  contactosFamiliares?: ContactoFamiliar[];
}

export interface ContactoFamiliar {
  id: number;
  nombreContacto: string;
  emailPadre?: string;
  telefonoPadre?: string;
  emailMadre?: string;
  telefonoMadre?: string;
}