// src/app/models/turno.model.ts
export interface TurnoAgenda {
  id: number;
  hora: string;
  estado: string;
  tratamiento: string;
  cliente: { id: number; nombre: string; apellido: string };
  asistio: boolean | null;
}