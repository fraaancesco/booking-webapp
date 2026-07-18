import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-code.enum';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;
    jwtService = {
      signAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    authService = new AuthService(usersService, jwtService);
  });

  describe('register', () => {
    it('throws AppException with AUTH_EMAIL_ALREADY_REGISTERED if email already exists', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: '1',
        email: 'a@a.com',
        passwordHash: 'hash',
        createdAt: new Date(),
      });

      await expect(
        authService.register('a@a.com', 'password123'),
      ).rejects.toMatchObject({
        constructor: AppException,
        response: { code: ErrorCode.AUTH_EMAIL_ALREADY_REGISTERED },
      });
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('creates user and returns id/email without password', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: '1',
        email: 'a@a.com',
        passwordHash: 'hash',
        createdAt: new Date(),
      });

      const result = await authService.register('a@a.com', 'password123');

      expect(result).toEqual({ id: '1', email: 'a@a.com' });
      expect(usersService.create).toHaveBeenCalledWith(
        'a@a.com',
        'password123',
      );
    });
  });

  describe('login', () => {
    it('throws AppException with AUTH_INVALID_CREDENTIALS if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login('a@a.com', 'password123'),
      ).rejects.toMatchObject({
        response: { code: ErrorCode.AUTH_INVALID_CREDENTIALS },
      });
    });

    it('throws AppException with AUTH_INVALID_CREDENTIALS if password does not match', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: '1',
        email: 'a@a.com',
        passwordHash: await bcrypt.hash('correct-password', 10),
        createdAt: new Date(),
      });

      await expect(
        authService.login('a@a.com', 'wrong-password'),
      ).rejects.toMatchObject({
        response: { code: ErrorCode.AUTH_INVALID_CREDENTIALS },
      });
    });

    it('returns access_token on valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue({
        id: '1',
        email: 'a@a.com',
        passwordHash: await bcrypt.hash('password123', 10),
        createdAt: new Date(),
      });
      jwtService.signAsync.mockResolvedValue('signed-token');

      const result = await authService.login('a@a.com', 'password123');

      expect(result).toEqual({ access_token: 'signed-token' });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: '1',
        email: 'a@a.com',
      });
    });
  });
});
