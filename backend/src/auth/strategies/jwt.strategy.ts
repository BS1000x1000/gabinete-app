// import { Injectable } from "@nestjs/common";
// import { PassportStrategy } from "@nestjs/passport";
// import { SECRET } from "constants/jwt-key";
// import { ExtractJwt } from "passport-jwt";
// import { Strategy } from "passport-local";

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//     constructor() {
//         super({
//             jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//             ignoreExpiration: false, 
//             secretOrKey: SECRET
//         } as any);
//     }

//     async validate(payload: any) {
//         return {userId: payload.sub, usuario: payload.usuario, rol: payload.rol }
//     }
// }