import { 
  Body, 
  Controller, 
  Get, 
  Post, 
  Request, 
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TrabajadorService } from '../trabajador/trabajador.service';
import { CreateTrabajadorDto } from '../trabajador/dto/trabajador.dto';
import { ChangePasswordDto } from '../trabajador/dto/change-password.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly trabajadorService: TrabajadorService,
  ) {}

  /**
   * Registro de nuevo trabajador
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: CreateTrabajadorDto) {
    this.logger.log(`Registrando nuevo trabajador: ${body.username}`);
    const trabajador = await this.trabajadorService.create(body);
    
    return {
      message: 'Trabajador registrado exitosamente',
      user: {
        id: trabajador.id,
        username: trabajador.username,
        nombre: trabajador.nombre,
        apellidos: trabajador.apellidos,
        email: trabajador.email,
        rol: trabajador.rol,
      },
    };
  }

  /**
   * Login de trabajador
   * Rate limit estricto: 5 intentos por minuto por IP
   */
  @UseGuards(ThrottlerGuard, LocalAuthGuard)
  @Throttle({ global: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req) {
    this.logger.log(`Login exitoso: ${req.user.username}`);
    return this.authService.login(req.user);
  }

  /**
   * Obtener perfil del trabajador autenticado
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    this.logger.log(`Obteniendo perfil de: ${req.user.username} (${req.user.userId})`);
    return await this.trabajadorService.findOne(req.user.userId);
  }

  /**
   * Verificar si el token es valido
   */
  @UseGuards(JwtAuthGuard)
  @Get('verify')
  async verifyToken(@Request() req) {
    return {
      valid: true,
      user: {
        id: req.user.userId,
        username: req.user.username,
        rol: req.user.rol,
      },
    };
  }

  /**
   * Renovar token
   */
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Request() req) {
    this.logger.log(`Renovando token para: ${req.user.username}`);
    const trabajador = await this.trabajadorService.findOne(req.user.userId);
    return this.authService.login(trabajador);
  }

  /**
   * Cambiar contrasena (requiere estar autenticado y conocer la contrasena actual)
   */
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Request() req, @Body() body: ChangePasswordDto) {
    this.logger.log(`Cambio de contrasena para: ${req.user.username}`);
    return this.authService.changePassword(req.user.userId, body.oldPassword, body.newPassword);
  }

  /**
   * Solicitar reset de contrasena por email
   * Rate limit estricto: 3 intentos por minuto por IP
   */
  @UseGuards(ThrottlerGuard)
  @Throttle({ global: { limit: 3, ttl: 60000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  /**
   * Resetear contrasena usando token
   */
  @UseGuards(ThrottlerGuard)
  @Throttle({ global: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}
