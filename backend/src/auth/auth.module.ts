import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuditService } from "./audit.service";
import { TrabajadorService } from "src/trabajador/trabajador.service";
import { LocalStrategy } from "./strategies/local.strategy";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { AuthController } from "./auth.controller";
import { TrabajadorModule } from "src/trabajador/trabajador.module";
import { NotificacionesModule } from "src/notificaciones/notificaciones.module";

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.SECRET,
            signOptions: { expiresIn: '2h' }
        }),
        TrabajadorModule,
        NotificacionesModule,
    ],
    providers: [AuthService, AuditService, TrabajadorService, LocalStrategy, JwtStrategy],
    controllers: [AuthController],
    exports: [AuditService],
})
export class AuthModule {}