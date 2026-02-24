/**
 * Área de desarrollo (categoría de objetivos)
 */
export interface AreaDesarrollo {
  id: string;
  nombre: string; // "Comprensión Lectora", "Atención", etc.
  descripcion?: string;
  color?: string; // "#3B82F6"
  orden: number;
  activo: boolean;
}

/**
 * Objetivo General (plantilla reutilizable)
 */
export interface ObjetivoGeneral {
  id: string;
  titulo: string; // "Comprensión Inferencial"
  descripcion?: string;
  activo: boolean;
  areaDesarrolloId: string;
  areaDesarrollo: AreaDesarrollo;
  
  // Estadísticas (cuando viene desde endpoint con stats)
  _count?: {
    clientesQueLoTienen: number;
    registrosDondeSeTrabajo: number;
  };
}

/**
 * Objetivo asignado a un cliente específico
 */
export interface ObjetivoCliente {
  id: string;
  fechaAsignacion: string;
  activo: boolean;
  
  // Relaciones
  clienteId: string;
  objetivoGeneralId: string;
  objetivoGeneral: ObjetivoGeneral;
  
  // Estadísticas de uso (cuando vienen del endpoint)
  vecesTrabajado?: number;
  ultimaVez?: string | null;
}

/**
 * DTO para asignar objetivos a un cliente
 */
export interface AsignarObjetivosDto {
  objetivosGeneralesIds: string[];
}

/**
 * Respuesta del endpoint de objetivos del cliente
 */
export interface ClienteObjetivosResponse {
  cliente: string;
  objetivos: {
    id: string;
    objetivoGeneralId: string;
    area: string;
    titulo: string;
    descripcion?: string;
    color?: string;
    fechaAsignacion: string;
    vecesTrabajado: number;
    ultimaVez: string | null;
  }[];
}

/**
 * Estadísticas de objetivos del cliente
 */
export interface EstadisticasObjetivos {
  cliente: string;
  totalObjetivosAsignados: number;
  totalSesiones: number;
  objetivosMasTrabajados: {
    titulo: string;
    area: string;
    veces: number;
  }[];
}