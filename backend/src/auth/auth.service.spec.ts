import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuditService } from './audit.service';
import { TrabajadorService } from '../trabajador/trabajador.service';
import { MotorReglasService } from '../notificaciones/motor-reglas.service';

// ── Mock factories ──────────────────────────────────────────────────────────
const mockUser = (overrides: Record<string, any> = {}) => ({
  id: 'user-1',
  username: 'terapeuta1',
  passwordHash: '$2b$10$hashedpassword',
  nombre: 'Laura',
  apellidos: 'Martín',
  email: 'laura@gabinete.es',
  activo: true,
  rol: {
    id: 'rol-1',
    nombreRol: 'Pedagogo',
    codigo: 'PEDAGOGO',
  },
  ...overrides,
});

const makeTrabajadorMock = () => ({
  findByUsername: jest.fn(),
  findByEmail: jest.fn(),
  findOne: jest.fn(),
  cambiarPassword: jest.fn(),
  guardarResetToken: jest.fn(),
  findByResetToken: jest.fn(),
  resetPasswordConToken: jest.fn(),
});

const makeJwtMock = () => ({
  sign: jest.fn().mockReturnValue('mocked.jwt.token'),
});

const makeMotorReglasMock = () => ({
  evaluarReglas: jest.fn().mockResolvedValue(undefined),
});

// ── Suite ───────────────────────────────────────────────────────────────────
describe('AuthService', () => {
  let service: AuthService;
  let trabajadorService: ReturnType<typeof makeTrabajadorMock>;
  let jwtService: ReturnType<typeof makeJwtMock>;
  let motorReglas: ReturnType<typeof makeMotorReglasMock>;

  beforeEach(async () => {
    trabajadorService = makeTrabajadorMock();
    jwtService = makeJwtMock();
    motorReglas = makeMotorReglasMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: TrabajadorService, useValue: trabajadorService },
        { provide: JwtService, useValue: jwtService },
        { provide: MotorReglasService, useValue: motorReglas },
        { provide: AuditService, useValue: { registrar: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ── validateUser ────────────────────────────────────────────────────────
  describe('validateUser()', () => {
    it('devuelve null si el usuario no existe', async () => {
      trabajadorService.findByUsername.mockResolvedValue(null);

      const result = await service.validateUser({
        username: 'noexiste',
        password: '1234',
      });

      expect(result).toBeNull();
    });

    it('devuelve null si el usuario está inactivo', async () => {
      trabajadorService.findByUsername.mockResolvedValue(
        mockUser({ activo: false }),
      );

      const result = await service.validateUser({
        username: 'terapeuta1',
        password: 'cualquier',
      });

      expect(result).toBeNull();
    });

    it('devuelve null si la contraseña es incorrecta', async () => {
      // bcrypt.compare devolverá false para un hash inventado
      trabajadorService.findByUsername.mockResolvedValue(mockUser());

      const result = await service.validateUser({
        username: 'terapeuta1',
        password: 'contraseña_incorrecta',
      });

      expect(result).toBeNull();
    });

    it('devuelve el usuario sin passwordHash si las credenciales son correctas', async () => {
      // Usamos un hash bcrypt real de la contraseña "correcto"
      const bcrypt = require('bcrypt');
      const hash = await bcrypt.hash('correcto', 10);
      trabajadorService.findByUsername.mockResolvedValue(
        mockUser({ passwordHash: hash }),
      );

      const result = await service.validateUser({
        username: 'terapeuta1',
        password: 'correcto',
      });

      expect(result).not.toBeNull();
      expect(result).not.toHaveProperty('passwordHash');
      expect(result?.username).toBe('terapeuta1');
      expect(result?.id).toBe('user-1');
    });
  });

  // ── login ───────────────────────────────────────────────────────────────
  describe('login()', () => {
    it('lanza UnauthorizedException si user es null', async () => {
      await expect(service.login(null)).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si user está inactivo', async () => {
      await expect(service.login(mockUser({ activo: false }))).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('genera token JWT con payload correcto', async () => {
      const user = mockUser();

      const result = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-1',
          username: 'terapeuta1',
          rol: 'PEDAGOGO',
        }),
      );
      expect(result.access_token).toBe('mocked.jwt.token');
      expect(result.token_type).toBe('Bearer');
    });

    it('devuelve los datos del usuario en la respuesta', async () => {
      const user = mockUser();

      const result = await service.login(user);

      expect(result.user).toMatchObject({
        id: 'user-1',
        username: 'terapeuta1',
        nombre: 'Laura',
        apellidos: 'Martín',
        email: 'laura@gabinete.es',
        rol: { codigo: 'PEDAGOGO' },
      });
    });

    it('evalúa reglas de notificaciones en background sin bloquear', async () => {
      const user = mockUser();
      motorReglas.evaluarReglas.mockResolvedValue(undefined);

      const result = await service.login(user);

      // No bloqueante: el login ya devolvió resultado
      expect(result.access_token).toBeDefined();
      // La llamada puede ocurrir asíncronamente; verificamos que se configuró
      expect(motorReglas.evaluarReglas).toHaveBeenCalledWith('user-1', 'PEDAGOGO');
    });
  });

  // ── forgotPassword ──────────────────────────────────────────────────────
  describe('forgotPassword()', () => {
    it('devuelve mensaje genérico si el email no existe (sin revelar info)', async () => {
      trabajadorService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword('noexiste@mail.com');

      expect(result.message).toContain('Si el email existe');
      expect(trabajadorService.guardarResetToken).not.toHaveBeenCalled();
    });

    it('devuelve mensaje genérico si el usuario está inactivo', async () => {
      trabajadorService.findByEmail.mockResolvedValue(mockUser({ activo: false }));

      const result = await service.forgotPassword('laura@gabinete.es');

      expect(result.message).toContain('Si el email existe');
      expect(trabajadorService.guardarResetToken).not.toHaveBeenCalled();
    });

    it('genera y guarda token de reset si el usuario es válido', async () => {
      trabajadorService.findByEmail.mockResolvedValue(mockUser());
      trabajadorService.guardarResetToken.mockResolvedValue(undefined);

      const result = await service.forgotPassword('laura@gabinete.es');

      expect(trabajadorService.guardarResetToken).toHaveBeenCalledWith(
        'user-1',
        expect.any(String),
        expect.any(Date),
      );
      // El servicio devuelve mensaje genérico — el token va solo por email, nunca en la respuesta
      expect(result.message).toContain('Si el email existe');
    });
  });

  // ── resetPassword ───────────────────────────────────────────────────────
  describe('resetPassword()', () => {
    it('lanza UnauthorizedException si el token es inválido o expirado', async () => {
      trabajadorService.findByResetToken.mockResolvedValue(null);

      await expect(service.resetPassword('token-invalido', 'nueva')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('resetea la contraseña si el token es válido', async () => {
      trabajadorService.findByResetToken.mockResolvedValue(mockUser());
      trabajadorService.resetPasswordConToken.mockResolvedValue(undefined);

      const result = await service.resetPassword('token-valido', 'NuevaPass123!');

      expect(trabajadorService.resetPasswordConToken).toHaveBeenCalledWith(
        'user-1',
        'NuevaPass123!',
      );
      expect(result.message).toContain('Contrasena actualizada');
    });
  });
});
