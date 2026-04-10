import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { Request } from "express";

function extractFromCookieOrBearer(req: Request): string | null {
    if (req?.cookies?.access_token) return req.cookies.access_token;
    const authHeader = req?.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
    return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([extractFromCookieOrBearer]),
            ignoreExpiration: false,
            secretOrKey: process.env.SECRET,
        } as any);
    }

    async validate(payload: any) {
        // Verificar usuario activo
        const user = await this.prisma.trabajador.findUnique({
            where: { id: payload.sub },
            select: { id: true, activo: true },
        });

        if (!user || !user.activo) {
            throw new UnauthorizedException('Usuario inactivo o no encontrado');
        }

        // Verificar token no revocado
        if (payload.jti) {
            const revocado = await this.prisma.tokenRevocado.findUnique({
                where: { jti: payload.jti },
            });
            if (revocado) throw new UnauthorizedException('Token revocado');
        }

        return { userId: payload.sub, username: payload.username, rol: payload.rol, nombre: payload.nombre, apellidos: payload.apellidos };
    }
}
