// interfaces/cliente.interface.ts
export interface Cliente {
  id: number;
  nombre: string;
  apellidos: string;
  fechaNacimiento: Date;
  domicilio: string;
  curso: string;
  diagnostico: string;
  tratamientos: string;
  medicacion: string;
  alergias: string | null;
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