import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AccesoClienteService } from '../../common/acceso/acceso-cliente.service';

/**
 * Comprueba que quien pide tiene asignado al menor detras del objetivo GAS.
 *
 * El modulo `gas` estaba limitado a ROLES_CLINICOS pero sin acotar por cliente:
 * con el id de un ClienteObjetivo, cualquier terapeuta leia y escribia la
 * evaluacion del desarrollo de un menor que no atiende.
 *
 * Va como guard y no repartido por los metodos porque TODAS las rutas del
 * modulo cuelgan del mismo nexo (`clienteObjetivoId`, o `evaluacionId` en el
 * borrado): un solo sitio que no se puede olvidar al anadir un endpoint nuevo.
 */
@Injectable()
export class AccesoObjetivoGasGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly acceso: AccesoClienteService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const { clienteObjetivoId, evaluacionId } = req.params ?? {};

    const clienteId = clienteObjetivoId
      ? await this.clienteDeObjetivo(clienteObjetivoId)
      : await this.clienteDeEvaluacion(evaluacionId);

    await this.acceso.assertAcceso(
      clienteId,
      req.user,
      'los objetivos de este cliente',
    );
    return true;
  }

  private async clienteDeObjetivo(clienteObjetivoId: string): Promise<string> {
    const objetivo = await this.prisma.clienteObjetivo.findUnique({
      where: { id: clienteObjetivoId },
      select: { clienteId: true },
    });
    if (!objetivo) {
      throw new NotFoundException(
        `Objetivo de cliente ${clienteObjetivoId} no encontrado`,
      );
    }
    return objetivo.clienteId;
  }

  private async clienteDeEvaluacion(evaluacionId?: string): Promise<string> {
    if (!evaluacionId) {
      // Ninguna ruta del modulo llega aqui hoy. Si alguna lo hiciera sin
      // identificar al cliente, es preferible que falle a que pase de largo.
      throw new NotFoundException('No se puede resolver el cliente de la petición');
    }
    const evaluacion = await this.prisma.evaluacionGAS.findUnique({
      where: { id: evaluacionId },
      select: { clienteObjetivo: { select: { clienteId: true } } },
    });
    if (!evaluacion) {
      throw new NotFoundException(`Evaluación ${evaluacionId} no encontrada`);
    }
    return evaluacion.clienteObjetivo.clienteId;
  }
}
