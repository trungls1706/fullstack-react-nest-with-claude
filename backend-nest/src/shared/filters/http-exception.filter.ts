import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.log(exception)
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    this.logger.error(
      `${request.method} ${request.url} - ${status}: ${message}`,
    );

    response.status(status).json({
      success: false,
      error: {
        code: status === 500 ? 'SYS_001' : 'SYS_002',
        message:
          typeof errorResponse === 'object' && errorResponse !== null
            ? (errorResponse as any).message ?? message
            : message,
        details:
          typeof errorResponse === 'object' && errorResponse !== null
            ? errorResponse
            : {},
      },
    });
  }
}
