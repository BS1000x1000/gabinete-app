import { SesionData } from '../interface/sesion.interface';

/**
 * @deprecated Usar SesionData en su lugar
 * Mantener temporalmente para compatibilidad con código existente
 */
export interface TurnoAgenda {
  id: string;
  hora: string;
  estado: string;
  tratamiento: string;
  cliente: { 
    id: string; 
    nombre: string; 
    apellido: string;
  };
  asistio: boolean | null;
}

/**
 * Helper para convertir SesionData a TurnoAgenda (temporal)
 */
export function sesionToTurno(sesion: SesionData): TurnoAgenda {
  return {
    id: sesion.id,
    hora: new Date(sesion.fechaHoraInicio).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    estado: sesion.estado,
    tratamiento: sesion.tipoSesion,
    cliente: {
      id: sesion.cliente.id,
      nombre: sesion.cliente.nombre,
      apellido: sesion.cliente.apellidos
    },
    asistio: sesion.asistio || null
  };
}