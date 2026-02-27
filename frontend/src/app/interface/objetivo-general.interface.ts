/**
 * Área de desarrollo (categoría de objetivos)
 */
export interface AreaDesarrollo {
  id: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  orden: number;
  activo: boolean;
}

/**
 * Objetivo General (plantilla reutilizable)
 */
export interface ObjetivoGeneral {
  id: string;
  titulo: string;
  descripcion?: string;
  activo: boolean;
  areaDesarrolloId: string;
  areaDesarrollo: AreaDesarrollo;

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
  clienteId: string;
  objetivoGeneralId: string;
  objetivoGeneral: ObjetivoGeneral;
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
 * Respuesta del endpoint GET /clientes/:id/objetivos-generales
 * Cada objetivo incluye los campos GAS para mostrar el estado actual
 */
export interface ClienteObjetivosResponse {
  cliente: string;
  objetivos: {
    id: string;                      // clienteObjetivoId
    objetivoGeneralId: string;
    area: string;
    titulo: string;
    descripcion?: string;
    color?: string;
    fechaAsignacion: string;
    vecesTrabajado: number;
    ultimaVez: string | null;
    // ── Campos GAS ──────────────────────────────────────────
    nivelGASActual: number | null;          // -2, -1, 0, 1, 2 — null si aún no evaluado
    fechaUltimaEvaluacion: string | null;   // ISO string de la última evaluación
    nivelesDefinidos: boolean;              // true si ya tiene los 5 niveles descritos
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