
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Logging Interceptor
 * Logs incoming requests and outgoing responses with timing
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }
  
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = request;
    const correlationId = request.correlationId || 'N/A';
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip || request.connection?.remoteAddress;

    const startTime = Date.now();

    this.logger.log(
      `[${correlationId}] Incoming Request: ${method} ${url}`,
      {
        correlationId,
        method,
        url,
        body: this.sanitizeBody(body),
        query,
        params,
        userAgent,
        ip,
      },
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const duration = Date.now() - startTime;

          this.logger.log(
            `[${correlationId}] Outgoing Response: ${method} ${url} - ${response.statusCode} - ${duration}ms`,
            {
              correlationId,
              statusCode: response.statusCode,
              duration,
            },
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          this.logger.error(
            `[${correlationId}] Request Error: ${method} ${url} - ${error.status || 500} - ${duration}ms`,
            {
              correlationId,
              error: error.message,
              duration,
            },
          );
        },
      }),
    );
  }

  /**
   * Sanitize sensitive fields from request body for logging
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = ['password', 'confirmPassword', 'newPassword', 'token', 'refreshToken', 'accessToken', 'otp', 'otpCode'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}


