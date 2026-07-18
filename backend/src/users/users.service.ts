import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(email: string, password: string): Promise<User> {
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const user = this.usersRepository.create({ email, passwordHash });
    return this.usersRepository.save(user);
  }
}
