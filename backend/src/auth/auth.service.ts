import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { QueryFailedError } from 'typeorm';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-code.enum';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './jwt-payload.interface';

const POSTGRES_UNIQUE_VIOLATION = '23505';

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof QueryFailedError &&
    (error as QueryFailedError & { code?: string }).code ===
      POSTGRES_UNIQUE_VIOLATION
  );
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new AppException(
        ErrorCode.AUTH_EMAIL_ALREADY_REGISTERED,
        HttpStatus.CONFLICT,
      );
    }
    try {
      const user = await this.usersService.create(email, password);
      return { id: user.id, email: user.email };
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new AppException(
          ErrorCode.AUTH_EMAIL_ALREADY_REGISTERED,
          HttpStatus.CONFLICT,
        );
      }
      throw error;
    }
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppException(
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        HttpStatus.UNAUTHORIZED,
      );
    }
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token };
  }
}
