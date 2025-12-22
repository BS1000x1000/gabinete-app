import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LoginDto } from 'src/trabajador/dto/login.dto';
import { TrabajadorService } from 'src/trabajador/trabajador.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private userService: TrabajadorService, private jwtService: JwtService) {}

  async validateUser(body: LoginDto) {
    try {
      const user = await this.userService.findUser(body.usuario);
      const matchResult = await bcrypt.compare(
        body.password,
        user?.password ?? '',
      );
      if (user && matchResult) {
        const {passwordHash, ...result} = user;
        return result;
      }
      return null;
    } catch (error) {
      if (error instanceof Error)
        throw new InternalServerErrorException(
          `Fallo al validar Usuario: ${error.message}`,
        );
    }
  }

  async login(user: any) {
    const payload = {usuario: user.usuario, sub: user.id, rol: user.rol.codigo}
    return {
        access_token: this.jwtService.sign(payload)
    }
  }
}
