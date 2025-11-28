export interface HorarioData {
  id: string;
  fechaHoraInicio: string; // ISO
  fechaHoraFin: string;
  tipoSesion: string;
  estado: 'programada' | 'confirmada' | 'cancelada';
  notas?: string;
  clienteId: string;
  trabajadorId: string;
  cliente: {
    id: string;
    nombre: string;
    apellidos: string;
  };
  asistio?: boolean | null;
}
