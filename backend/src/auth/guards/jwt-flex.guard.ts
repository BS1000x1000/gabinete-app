import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  sub: string;
  username: string;
  rol: string;
  nombre: string;
  apellidos: string;
}

/**
 * Guard JWT que acepta el token tanto desde el header Authorization: Bearer
 * como desde el query param ?token=. Necesario para el endpoint SSE, ya que
 * EventSource del navegador no admite cabeceras personalizadas.
 */
@Injectable()
export class JwtFlexGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    const authHeader = req.headers?.authorization as string | undefined;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = bearerToken ?? (req.query?.token as string | undefined);

    if (!token) throw new UnauthorizedException();

    try {
      const payload = jwt.verify(token, process.env.SECRET as string) as JwtPayload;
      req.user = {
        sub: payload.sub,
        username: payload.username,
        rol: payload.rol,
        nombre: payload.nombre,
        apellidos: payload.apellidos,
      };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
