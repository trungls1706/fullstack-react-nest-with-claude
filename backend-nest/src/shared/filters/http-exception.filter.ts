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

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let code = 'SYS_001';
    let message = 'Internal server error';
    let details: Record<string, unknown> | undefined;

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, unknown>;
        message = (r.message as string) ?? exception.message;
        code = (r.code as string) ?? defaultCodeForStatus(status);
        details = r.details as Record<string, unknown> | undefined;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(exception.stack);
    }

    this.logger.warn(`${request.method} ${request.url} -> ${status} ${code}`);

    response.status(status).json({
      success: false,
      error: { code, message, ...(details ? { details } : {}) },
    });
  }
}

function defaultCodeForStatus(status: number): string {
  if (status === 400) return 'SYS_002';
  if (status === 401) return 'AUTH_003';
  if (status === 403) return 'AUTH_004';
  if (status === 404) return 'SYS_001';
  return 'SYS_001';
}
