import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';

describe('ResponseInterceptor', () => {
  it('wraps the handler payload into the generic success envelope', (done) => {
    const interceptor = new ResponseInterceptor<{ id: string }>();
    const handler: CallHandler<{ id: string }> = {
      handle: () => of({ id: '1' }),
    };

    interceptor
      .intercept({} as ExecutionContext, handler)
      .subscribe((result) => {
        expect(result).toEqual({
          success: true,
          errorMessage: null,
          data: { id: '1' },
        });
        done();
      });
  });
});
