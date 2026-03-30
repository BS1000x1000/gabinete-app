/**
 * Registro diario con objetivos trabajados
 */
export interface RegistroDiario {
  id?: string;
  fechaRegistro: string; // ISO string
  contenido: string;
  
  clienteId: string;
  trabajadorId: string;
  
  // Relaciones populadas
  cliente?: {
    id: string;
    nombre: string;
    apellidos: string;
  };
  
  trabajador?: {
    id: string;
    nombre: string;
    apellidos: string;
  };
  
  // ✅ NUEVO: Objetivos generales trabajados en esta sesión
  objetivosGeneralesTrabajados?: ObjetivoTrabajado[];
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Objetivo trabajado en un registro específico (respuesta del API)
 */
export interface ObjetivoTrabajado {
  id: string;
  notasRegistro?: string | null;
  objetivoGeneral: {
    id: string;
    titulo: string;
    areaDesarrollo: {
      nombre: string;
      color?: string;
    };
  };
}

/**
 * Item de objetivo trabajado para enviar al API (con notas opcionales)
 */
export interface ObjetivoTrabajadoInput {
  objetivoGeneralId: string;
  notasRegistro?: string;
}

/**
 * DTO para crear un registro diario
 */
export interface CreateRegistroDiarioDto {
  clienteId: string;
  contenido: string;
  fechaRegistro?: string;
  sesionId?: string; // Vincular a una sesión específica
  objetivosGeneralesTrabajados?: ObjetivoTrabajadoInput[];
}

/**
 * DTO para actualizar un registro diario
 */
export interface UpdateRegistroDiarioDto {
  contenido?: string;
  objetivosGeneralesTrabajados?: ObjetivoTrabajadoInput[];
}