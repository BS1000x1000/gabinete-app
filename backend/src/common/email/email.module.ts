import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';

/**
 * Global por el mismo motivo que `AccesoModule` y `TareasModule`: el correo lo
 * necesitan modulos que no tienen nada que ver entre si (facturas, expediente,
 * informes periodicos, avisos), y hasta ahora `EmailService` se declaraba como
 * provider suelto dentro de `FacturasModule`, asi que era literalmente
 * inyectable solo desde alli. Cualquier otro modulo que quisiera mandar un
 * correo tenia que redeclararlo, y dos instancias del mismo transporte SMTP es
 * justo lo que no se quiere.
 */
@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
