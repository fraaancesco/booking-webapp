import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-code.enum';

export class AppException extends HttpException {
  constructor(code: ErrorCode, status: HttpStatus) {
    super({ code }, status);
  }
}
