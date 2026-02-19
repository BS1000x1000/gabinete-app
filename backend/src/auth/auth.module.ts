import { Module } from "@nestjs/common";
// import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TrabajadorService } from "src/trabajador/trabajador.service";
import { LocalStrategy } from "./strategies/local.strategy";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { AuthController } from "./auth.controller";
import { TrabajadorModule } from "src/trabajador/trabajador.module";

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.SECRET,
            signOptions: { expiresIn: '8hrs'}
        }), 
        TrabajadorModule
    ],
    // controllers: [AuthController],
    providers: [AuthService, TrabajadorService, LocalStrategy, JwtStrategy], 
    controllers: [AuthController]
})
export class AuthModule {}