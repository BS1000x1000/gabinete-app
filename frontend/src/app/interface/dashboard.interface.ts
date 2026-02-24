/**
 * Estadísticas generales del sistema
 */
export interface EstadisticasGenerales {
  clientes: {
    total: number;
    activos: number;
    inactivos: number;
  };
  trabajadores: {
    total: number;
    activos: number;
    inactivos: number;
  };
  sesiones: {
    hoy: number;
    estaSemana: number;
  };
  registros: {
    ultimaSemana: number;
  };
  objetivos: {
    totalObjetivosGenerales: number;
    totalAreas: number;
  };
}

/**
 * Estadísticas del trabajador autenticado
 */
export interface EstadisticasTrabajador {
  clientesAsignados: number;
  sesiones: {
    hoy: number;
    esteMes: number;
    porEstado: {
      completadas: number;
      programadas: number;
      canceladasConAviso: number;
      canceladasSinAviso: number;
    };
  };
  registros: {
    esteMes: number;
  };
}

/**
 * Cliente más activo
 */
export interface ClienteMasActivo {
  cliente: {
    id: string;
    nombre: string;
    apellidos: string;
    curso: string;
    activo: boolean;
  };
  totalSesiones: number;
}

/**
 * Objetivo más trabajado
 */
export interface ObjetivoMasTrabajado {
  objetivo: {
    id: string;
    titulo: string;
    area: string;
    color?: string;
  };
  vecesUtilizado: number;
}

/**
 * Actividad reciente
 */
export interface ActividadReciente {
  id: string;
  fecha: string;
  cliente: string;
  trabajador: string;
  resumen: string;
  objetivosTrabajados: number;
}

/**
 * Distribución de sesiones por tipo
 */
export interface DistribucionSesiones {
  tipo: string;
  cantidad: number;
}

/**
 * Resumen completo del dashboard
 */
export interface ResumenDashboard {
  estadisticas: EstadisticasTrabajador | EstadisticasGenerales;
  clientesMasActivos: ClienteMasActivo[];
  objetivosMasTrabajados: ObjetivoMasTrabajado[];
  actividadReciente: ActividadReciente[];
  distribucionSesiones: DistribucionSesiones[];
}