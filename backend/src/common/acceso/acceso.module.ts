import { Global, Module } from '@nestjs/common';
import { AccesoClienteService } from './acceso-cliente.service';

/**
 * Global porque el control de acceso a un cliente lo necesita casi cualquier
 * modulo que lea datos clinicos, y olvidarse de importarlo es exactamente el
 * fallo que este servicio viene a evitar.
 */
@Global()
@Module({
  providers: [AccesoClienteService],
  exports: [AccesoClienteService],
})
export class AccesoModule {}
