export interface RegistroDiario {
  id?: string;
  fechaRegistro: Date;
  contenido: string;
  clienteId: string;
  trabajadorId: string;
  trabajador?: { nombre: string }; // Para mostrar quién escribió
}