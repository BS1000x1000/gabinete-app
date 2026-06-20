import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Response,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import * as jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { AuditService } from './audit.service';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { TrabajadorService } from '../trabajador/trabajador.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrabajadorDto } from '../trabajador/dto/trabajador.dto';
import { ChangePasswordDto } from '../trabajador/dto/change-password.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';

const COOKIE_NAME = 'access_token';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 2 * 60 * 60 * 1000, // 2h en ms
};

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
    private readonly trabajadorService: TrabajadorService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Registro de nuevo trabajador
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
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
  @UseGuards(LocalAuthGuard)
  @Throttle({ global: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req, @Response({ passthrough: true }) res: any) {
    this.logger.log(`Login exitoso: ${req.user.username}`);
    const result = await this.authService.login(req.user);

    // Enviar JWT como cookie HttpOnly — nunca expuesto a JavaScript
    res.cookie(COOKIE_NAME, result.access_token, cookieOptions);

    // Audit log
    this.auditService.registrar({
      evento: 'LOGIN_OK',
      userId: req.user.id,
      username: req.user.username,
      ip: req.ip,
    });

    // No devolver el token en el body
    const { access_token, ...publicData } = result;
    return publicData;
  }

  /**
   * Logout — revoca el JWT activo y borra la cookie
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Request() req: any,
    @Response({ passthrough: true }) res: any,
  ) {
    const token = (req as any).cookies?.[COOKIE_NAME];
    if (token) {
      try {
        const payload = jwt.decode(token) as any;
        if (payload?.jti && payload?.exp) {
          await this.prisma.tokenRevocado.create({
            data: { jti: payload.jti, expiresAt: new Date(payload.exp * 1000) },
          }).catch(() => {}); // ignorar si ya existe
        }
      } catch { /* token malformado, ignorar */ }
    }
    // Audit log
    if (token) {
      const decoded = jwt.decode(token) as any;
      this.auditService.registrar({
        evento: 'LOGOUT',
        userId: decoded?.sub,
        username: decoded?.username,
        ip: req.ip,
      });
    }

    res.clearCookie(COOKIE_NAME, { path: '/' });
    return { message: 'Sesión cerrada correctamente' };
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
  async refreshToken(@Request() req, @Response({ passthrough: true }) res: any) {
    this.logger.log(`Renovando token para: ${req.user.username}`);
    const trabajador = await this.trabajadorService.findOne(req.user.userId);
    const result = await this.authService.login(trabajador);

    res.cookie(COOKIE_NAME, result.access_token, cookieOptions);

    const { access_token, ...publicData } = result;
    return publicData;
  }

  /**
   * Cambiar contrasena propia (solo ADMIN — no requiere contrasena actual)
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Request() req, @Body() body: ChangePasswordDto) {
    this.logger.log(`Cambio de contrasena para: ${req.user.username}`);
    const result = await this.authService.changePassword(req.user.userId, body.passwordActual, body.passwordNueva);
    this.auditService.registrar({
      evento: 'PASSWORD_CHANGE',
      userId: req.user.userId,
      username: req.user.username,
      ip: req.ip,
    });
    return result;
  }

  /**
   * Solicitar reset de contrasena por email
   * Rate limit estricto: 3 intentos por minuto por IP
   */
  @Throttle({ global: { limit: 3, ttl: 60000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  /**
   * Resetear contrasena usando token
   */
  @Throttle({ global: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}
