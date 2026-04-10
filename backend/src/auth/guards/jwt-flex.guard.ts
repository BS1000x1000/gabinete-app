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
    const token = cookieToken ?? bearerToken ?? (req.query?.token as string | undefined);

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
