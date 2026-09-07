import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type UsuarioPeticion = { userId: string; rol: string };

/**
 * Comprobacion unica de "puede este usuario tocar este cliente".
 *
 * Existia copiada en cuatro sitios (clientes, documentos, expediente y —por
 * omision— export, que no la hacia en absoluto), y las copias NO eran iguales:
 * `documentos` y `expediente` no filtraban el soft-delete, asi que un cliente
 * dado de baja seguia siendo legible por sus endpoints clinicos. Al unificarlas
 * ese agujero se cierra tambien.
 *
 * ADMIN y RECEP ven todo el gabinete; un terapeuta, solo sus clientes asignados.
 */
@Injectable()
export class AccesoClienteService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * @param recurso texto para el 403, para que el mensaje siga diciendo a que
   *                no se tiene acceso ("la documentacion de este cliente").
   */
  async assertAcceso(
    clienteId: string,
    user?: UsuarioPeticion,
    recurso = 'la ficha de este cliente',
  ): Promise<void> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: clienteId, deletedAt: null },
      select: { id: true },
    });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }

    if (!user || user.rol === 'ADMIN' || user.rol === 'RECEP') return;

    const asignacion = await this.prisma.clienteTrabajador.findFirst({
      where: { clienteId, trabajadorId: user.userId, activo: true },
      select: { id: true },
    });
    if (!asignacion) {
      throw new ForbiddenException(`No tienes acceso a ${recurso}`);
    }
  }
}
