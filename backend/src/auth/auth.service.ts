import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { TrabajadorService } from '../trabajador/trabajador.service';
import { LoginDto } from '../trabajador/dto/login.dto';
import { MotorReglasService } from '../notificaciones/motor-reglas.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly trabajadorService: TrabajadorService,
    private readonly jwtService: JwtService,
    private readonly motorReglasService: MotorReglasService,
  ) {}

  /**
   * Validar credenciales del usuario (usado por LocalStrategy)
   */
  async validateUser(body: LoginDto) {
    try {
      const user = await this.trabajadorService.findByUsername(body.username);

      if (!user) {
        this.logger.warn(`Intento de login fallido: usuario ${body.username} no encontrado`);
        return null;
      }

      // Verificar que el usuario está activo
      if (!user.activo) {
        this.logger.warn(`Intento de login con usuario desactivado: ${body.username}`);
        return null;
      }

      const matchResult = await bcrypt.compare(
        body.password,
        user.passwordHash,
      );

      if (!matchResult) {
        this.logger.warn(`Intento de login fallido: contraseña incorrecta para ${body.username}`);
        return null;
      }

      // No incluir passwordHash en el resultado
      const { passwordHash, ...result } = user;
      return result;

    } catch (error) {
      this.logger.error(`Error al validar usuario: ${error.message}`);
      throw new InternalServerErrorException(
        'Error al validar las credenciales',
      );
    }
  }

  /**
   * Generar token JWT
   */
  async login(user: any) {
    // Validar que el usuario existe y está activo
    if (!user) {
      throw new UnauthorizedException('Usuario no válido');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    // Payload más completo
    const payload = {
      sub: user.id,              // ID del trabajador (estándar JWT)
      username: user.username,
      rol: user.rol.codigo,      // ADMIN, PEDAGOGO, etc.
      nombre: user.nombre,
      apellidos: user.apellidos,
    };

    const token = this.jwtService.sign(payload);

    this.logger.log(`Token generado para: ${user.username} (${user.id})`);

    // Evaluar reglas de notificaciones en background — no bloquea el login
    this.motorReglasService
      .evaluarReglas(user.id, user.rol.codigo)
      .catch((err) => this.logger.error('Error evaluando reglas:', err));

    // Respuesta más completa
    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: '8h',
      user: {
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        apellidos: user.apellidos,
        email: user.email,
        rol: {
          id: user.rol.id,
          nombre: user.rol.nombreRol,
          codigo: user.rol.codigo,
        },
      },
    };
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    try {
      const user = await this.trabajadorService.findByUsername(
        (await this.trabajadorService.findOne(userId)).username
      );

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const matchResult = await bcrypt.compare(oldPassword, user.passwordHash);

      if (!matchResult) {
        throw new UnauthorizedException('Contraseña actual incorrecta');
      }

      // Delegar el cambio al servicio de trabajadores
      return await this.trabajadorService.cambiarPassword(
        userId,
        oldPassword,
        newPassword,
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Error al cambiar contraseña: ${error.message}`);
      throw new InternalServerErrorException('Error al cambiar la contraseña');
    }
  }
}