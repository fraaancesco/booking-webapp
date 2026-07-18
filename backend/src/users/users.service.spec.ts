import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let usersService: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  beforeEach(() => {
    repository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    usersService = new UsersService(repository);
  });

  it('findByEmail delegates to repository', async () => {
    const user = { id: '1', email: 'a@a.com' } as User;
    repository.findOne.mockResolvedValue(user);

    const result = await usersService.findByEmail('a@a.com');

    expect(result).toBe(user);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { email: 'a@a.com' },
    });
  });

  it('create hashes the password before saving', async () => {
    repository.create.mockImplementation((entity) => entity as User);
    repository.save.mockImplementation((entity) =>
      Promise.resolve(entity as User),
    );

    const result = await usersService.create('a@a.com', 'password123');

    expect(result.email).toBe('a@a.com');
    expect(result.passwordHash).not.toBe('password123');
    expect(await bcrypt.compare('password123', result.passwordHash)).toBe(true);
  });
});
