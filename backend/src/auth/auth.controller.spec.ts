import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(() => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    controller = new AuthController(authService);
  });

  it('register delegates to AuthService.register', async () => {
    authService.register.mockResolvedValue({ id: '1', email: 'a@a.com' });

    const result = await controller.register({
      email: 'a@a.com',
      password: 'password123',
    });

    expect(authService.register).toHaveBeenCalledWith('a@a.com', 'password123');
    expect(result).toEqual({ id: '1', email: 'a@a.com' });
  });

  it('login delegates to AuthService.login', async () => {
    authService.login.mockResolvedValue({ access_token: 'token' });

    const result = await controller.login({
      email: 'a@a.com',
      password: 'password123',
    });

    expect(authService.login).toHaveBeenCalledWith('a@a.com', 'password123');
    expect(result).toEqual({ access_token: 'token' });
  });
});
