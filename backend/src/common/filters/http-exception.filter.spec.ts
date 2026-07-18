import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { AppException } from '../errors/app.exception';
import { ErrorCode } from '../errors/error-code.enum';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let response: { status: jest.Mock; json: jest.Mock };
  let host: ArgumentsHost;

  beforeEach(() => {
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const request = { method: 'GET', url: '/api/test' };
    host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;

    filter = new HttpExceptionFilter();
  });

  it('maps an AppException to its own ErrorCode and status', () => {
    filter.catch(
      new AppException(ErrorCode.BOOKING_NOT_FOUND, HttpStatus.NOT_FOUND),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      errorMessage: ErrorCode.BOOKING_NOT_FOUND,
      data: {},
    });
  });

  it('maps a generic HttpException via the status-to-code fallback', () => {
    filter.catch(new BadRequestException('invalid'), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      errorMessage: ErrorCode.VALIDATION_ERROR,
      data: {},
    });
  });

  it('maps an unknown status without a mapping to INTERNAL_ERROR', () => {
    filter.catch(new Error('boom'), host);

    expect(response.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      errorMessage: ErrorCode.INTERNAL_ERROR,
      data: {},
    });
  });

  it('logs a non-Error exception via String() instead of .stack', () => {
    const loggerErrorSpy = jest
      .spyOn(
        (filter as unknown as { logger: { error: () => void } }).logger,
        'error',
      )
      .mockImplementation(() => undefined);

    filter.catch('a raw string throw', host);

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      expect.any(String),
      'a raw string throw',
    );
  });
});
