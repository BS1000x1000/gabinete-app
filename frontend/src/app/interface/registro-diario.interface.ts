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
 * Objetivo trabajado en un registro específico
 */
export interface ObjetivoTrabajado {
  id: string;
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
 * DTO para crear un registro diario
 */
export interface CreateRegistroDiarioDto {
  clienteId: string;
  contenido: string;
  fechaRegistro?: string;
  sesionId?: string; // Vincular a una sesión específica
  objetivosGeneralesTrabajados?: string[];
}

/**
 * DTO para actualizar un registro diario
 */
export interface UpdateRegistroDiarioDto {
  contenido?: string;
  objetivosGeneralesTrabajados?: string[];
}