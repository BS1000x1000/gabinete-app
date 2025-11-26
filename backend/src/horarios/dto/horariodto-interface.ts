export class HorarioData {
  id?: string;
  fechaHoraInicio: string; // ISO
  fechaHoraFin: string;
  tipoSesion: string;
  estado: string;
  notas?: string | null;
  clienteId: string;
  trabajadorId: string;
}