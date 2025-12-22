// import { Module } from "@nestjs/common";
// import { AuthController } from "./auth.controller";
// import { AuthService } from "./auth.service";
// import { TrabajadorService } from "src/trabajador/trabajador.service";
// import { LocalStrategy } from "./strategies/local.strategy";
// import { PassportModule } from "@nestjs/passport";
// import { JwtModule } from "@nestjs/jwt";
// import { SECRET } from "constants/jwt-key";
// import { JwtStrategy } from "./strategies/jwt.strategy";

// @Module({
//     imports: [
//         PassportModule,
//         JwtModule.register({
//             secret: SECRET,
//             signOptions: { expiresIn: '8hrs'}
//         })
//     ],
//     controllers: [AuthController],
//     providers: [AuthService, TrabajadorService, LocalStrategy, JwtStrategy]
// })
// export class AuthModule {}