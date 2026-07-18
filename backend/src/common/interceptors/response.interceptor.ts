import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GenericResponseDto } from '../dto/generic-response.dto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  GenericResponseDto<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<GenericResponseDto<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        errorMessage: null,
        data,
      })),
    );
  }
}
