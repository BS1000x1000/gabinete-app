import { EstadoSesion, TipoSesion } from './sesion.interface';

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

// ============================================================
// HITO 3 — Dashboard operativo del día
// ============================================================

export interface SesionDashboard {
  id: string;
  horaInicio: string;
  horaFin: string;
  estado: EstadoSesion;
  tipoSesion: TipoSesion;
  modalidad?: 'PRESENCIAL' | 'ONLINE';
  urlVideollamada?: string | null;
  cliente: { id: string; nombre: string; apellidos: string };
  bonoActivo: { id: string; sesionesConsumidas: number; totalSesiones: number } | null;
}

export interface AlertaDashboard {
  id: string;
  tipo: string;
  prioridad: 'URGENTE' | 'ALTA' | 'MEDIA' | 'BAJA';
  titulo: string;
  mensaje: string;
  accionUrl: string | null;
  fechaCreacion: string;
}

export interface InformeBorrador {
  id: string;
  titulo: string;
  tipoInforme: string;
  updatedAt: string;
  cliente: { id: string; nombre: string; apellidos: string };
}

export interface BonoSinCobrar {
  id: string;
  totalSesiones: number;
  sesionesConsumidas: number;
  fechaFin: string | null;
  cliente: { id: string; nombre: string; apellidos: string };
}

export interface ObjetivoSinEvaluar {
  clienteObjetivoId: string;
  fechaUltimaEvaluacion: string | null;
  objetivo: string;
  cliente: { id: string; nombre: string; apellidos: string };
}

export interface MiDiaResponse {
  saludo: string;
  fecha: string;
  contadores: {
    sesionesHoy: number;
    registrosHoy: number;
    notificacionesUrgentes: number;
    bonosCriticos: number;
  };
  sesionesHoy: SesionDashboard[];
  alertasUrgentes: AlertaDashboard[];
  accionesPendientes: {
    informesEnBorrador: InformeBorrador[];
    bonosSinCobrar: BonoSinCobrar[];
    objetivosSinEvaluar: ObjetivoSinEvaluar[];
  };
  resumenMes: {
    clientesAsignados: number;
    sesiones: {
      esteMes: number;
      porEstado: {
        completadas: number;
        programadas: number;
        canceladasConAviso: number;
        canceladasSinAviso: number;
      };
    };
    registros: { esteMes: number };
  };
}

// ============================================================
// HITO H — Estadísticas avanzadas
// ============================================================

export interface EstadisticasAvanzadas {
  resumen: {
    totalSesiones: number;
    sesionesCompletadas: number;
    clientesActivos: number;
    totalRegistros: number;
  };
  evolucion: { semana: string; total: number }[];
  distribucion: { tipo: string; cantidad: number }[];
  sesionesPorEstado: { semana: string; completadas: number; programadas: number; canceladas: number }[];
  topClientes: { cliente: { id: string; nombre: string; apellidos: string }; total: number }[];
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