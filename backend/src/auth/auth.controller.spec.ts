import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TrabajadorService } from '../trabajador/trabajador.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

// ── Mock factories ────────────────────────────────────────────────────────────
const mockUser = (overrides: Record<string, any> = {}) => ({
  id: 'user-1',
  username: 'terapeuta1',
  nombre: 'Laura',
  apellidos: 'Martín',
  email: 'laura@gabinete.es',
  activo: true,
  rol: { id: 'rol-1', nombreRol: 'Pedagogo', codigo: 'PEDAGOGO' },
  ...overrides,
});

const mockReq = (overrides: Record<string, any> = {}) => ({
  user: {
    userId: 'user-1',
    username: 'terapeuta1',
    rol: 'PEDAGOGO',
    ...overrides,
  },
});

const makeAuthServiceMock = () => ({
  login: jest.fn(),
  changePassword: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
});

const makeTrabajadorServiceMock = () => ({
  create: jest.fn(),
  findOne: jest.fn(),
});

// ── Suite ─────────────────────────────────────────────────────────────────────
describe('AuthController', () => {
  let controller: AuthController;
  let authService: ReturnType<typeof makeAuthServiceMock>;
  let trabajadorService: ReturnType<typeof makeTrabajadorServiceMock>;

  beforeEach(async () => {
    authService = makeAuthServiceMock();
    trabajadorService = makeTrabajadorServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: TrabajadorService, useValue: trabajadorService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  // ── register ──────────────────────────────────────────────────────────────
  describe('register()', () => {
    it('crea el trabajador y devuelve la respuesta formateada', async () => {
      const body = {
        username: 'nuevo',
        nombre: 'Ana',
        apellidos: 'García',
        email: 'ana@gabinete.es',
        password: 'Pass123!',
      };
      const trabajador = mockUser({ username: 'nuevo', nombre: 'Ana', apellidos: 'García' });
      trabajadorService.create.mockResolvedValue(trabajador);

      const result = await controller.register(body as any);

      expect(trabajadorService.create).toHaveBeenCalledWith(body);
      expect(result.message).toContain('registrado');
      expect(result.user).toMatchObject({
        id: trabajador.id,
        username: trabajador.username,
      });
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────
  describe('login()', () => {
    it('llama a authService.login con el usuario del request', async () => {
      const loginResponse = {
        access_token: 'jwt.token',
        token_type: 'Bearer',
        user: mockUser(),
      };
      authService.login.mockResolvedValue(loginResponse);
      const req = { user: mockUser() };

      const result = await controller.login(req);

      expect(authService.login).toHaveBeenCalledWith(req.user);
      expect(result.access_token).toBe('jwt.token');
    });
  });

  // ── getProfile ────────────────────────────────────────────────────────────
  describe('getProfile()', () => {
    it('devuelve el perfil del usuario autenticado', async () => {
      const perfil = mockUser();
      trabajadorService.findOne.mockResolvedValue(perfil);

      const result = await controller.getProfile(mockReq());

      expect(trabajadorService.findOne).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(perfil);
    });
  });

  // ── verifyToken ───────────────────────────────────────────────────────────
  describe('verifyToken()', () => {
    it('devuelve valid=true con los datos del usuario del JWT', async () => {
      const result = await controller.verifyToken(mockReq());

      expect(result.valid).toBe(true);
      expect(result.user).toMatchObject({
        id: 'user-1',
        username: 'terapeuta1',
        rol: 'PEDAGOGO',
      });
    });
  });

  // ── refreshToken ──────────────────────────────────────────────────────────
  describe('refreshToken()', () => {
    it('busca el trabajador y genera nuevo token', async () => {
      const trabajador = mockUser();
      const loginResponse = { access_token: 'nuevo.jwt', token_type: 'Bearer', user: trabajador };
      trabajadorService.findOne.mockResolvedValue(trabajador);
      authService.login.mockResolvedValue(loginResponse);

      const result = await controller.refreshToken(mockReq());

      expect(trabajadorService.findOne).toHaveBeenCalledWith('user-1');
      expect(authService.login).toHaveBeenCalledWith(trabajador);
      expect(result.access_token).toBe('nuevo.jwt');
    });
  });

  // ── changePassword ────────────────────────────────────────────────────────
  describe('changePassword()', () => {
    it('delega al servicio con userId y contraseñas', async () => {
      const body = { oldPassword: 'vieja', newPassword: 'Nueva123!' };
      const expected = { message: 'Contraseña actualizada' };
      authService.changePassword.mockResolvedValue(expected);

      const result = await controller.changePassword(mockReq(), body as any);

      expect(authService.changePassword).toHaveBeenCalledWith('user-1', 'vieja', 'Nueva123!');
      expect(result).toEqual(expected);
    });
  });

  // ── forgotPassword ────────────────────────────────────────────────────────
  describe('forgotPassword()', () => {
    it('delega al servicio con el email', async () => {
      const expected = { message: 'Si el email existe recibirás un correo' };
      authService.forgotPassword.mockResolvedValue(expected);

      const result = await controller.forgotPassword({ email: 'laura@gabinete.es' });

      expect(authService.forgotPassword).toHaveBeenCalledWith('laura@gabinete.es');
      expect(result).toEqual(expected);
    });
  });

  // ── resetPassword ─────────────────────────────────────────────────────────
  describe('resetPassword()', () => {
    it('delega al servicio con token y nueva contraseña', async () => {
      const body = { token: 'abc123', newPassword: 'Nueva123!' };
      const expected = { message: 'Contrasena actualizada' };
      authService.resetPassword.mockResolvedValue(expected);

      const result = await controller.resetPassword(body as any);

      expect(authService.resetPassword).toHaveBeenCalledWith('abc123', 'Nueva123!');
      expect(result).toEqual(expected);
    });
  });
});
