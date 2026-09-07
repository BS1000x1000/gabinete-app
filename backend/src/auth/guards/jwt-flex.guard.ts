import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/prisma/prisma.service';

interface JwtPayload {
  sub: string;
  jti?: string;
  username: string;
  rol: string;
  nombre: string;
  apellidos: string;
}

/**
 * Guard JWT que acepta el token desde:
 * 1. Cookie HttpOnly `access_token` (preferido — enviada automáticamente por el browser, incluido EventSource)
 * 2. Header Authorization: Bearer (para clientes API)
 * 3. Query param ?token= (backward compat)
 */
@Injectable()
export class JwtFlexGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const cookieToken = req.cookies?.access_token as string | undefined;
    const authHeader = req.headers?.authorization as string | undefined;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    // Se acepto `?token=` mientras el SSE no podia mandar cookies. Desde que el
    // frontend conecta con `withCredentials` (notificaciones.service.ts) esa via
    // no la usa nadie, y un JWT en la query acaba en logs y proxies.
    const token = cookieToken ?? bearerToken;

    if (!token) throw new UnauthorizedException();

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, process.env.SECRET as string) as JwtPayload;
    } catch {
      throw new UnauthorizedException();
    }

    // Verificar que el token no esté revocado
    if (payload.jti) {
      const revocado = await this.prisma.tokenRevocado.findUnique({
        where: { jti: payload.jti },
      });
      if (revocado) throw new UnauthorizedException('Token revocado');
    }

    // Y que el usuario siga de alta. `JwtStrategy` ya lo comprobaba en cada
    // peticion; aqui no, asi que una baja conservaba su canal SSE abierto.
    const usuario = await this.prisma.trabajador.findUnique({
      where: { id: payload.sub },
      select: { activo: true },
    });
    if (!usuario?.activo) throw new UnauthorizedException();

    req.user = {
      sub: payload.sub,
      username: payload.username,
      rol: payload.rol,
      nombre: payload.nombre,
      apellidos: payload.apellidos,
    };
    return true;
  }
}
