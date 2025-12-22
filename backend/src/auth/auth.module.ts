import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TrabajadorService } from "src/trabajador/trabajador.service";
import { LocalStrategy } from "./strategies/local.strategy";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { SECRET } from "constants/jwt-key";

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: SECRET,
            signOptions: { expiresIn: '60s'}
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, TrabajadorService, LocalStrategy]
})
export class AuthModule {}