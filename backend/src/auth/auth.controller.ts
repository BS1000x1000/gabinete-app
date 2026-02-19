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
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TrabajadorService } from '../trabajador/trabajador.service';
import { CreateTrabajadorDto } from '../trabajador/dto/trabajador.dto';

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
    
    // No devolver datos sensibles
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
   */
  @UseGuards(LocalAuthGuard)
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
   * Verificar si el token es válido
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
    // Buscar usuario actualizado
    const trabajador = await this.trabajadorService.findOne(req.user.userId);
    return this.authService.login(trabajador);
  }
}