export class CreateRegistroDiarioDto {
  contenido: string;
  clienteId: string;
  // Opcional: permitir enviar una fecha específica si no es la actual
  fechaRegistro?: Date;
}