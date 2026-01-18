import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { randomUUID } from 'crypto';

/**
 * Correlation ID Interceptor
 * Adds a unique correlation ID to each request for request tracing
 * Accepts incoming x-correlation-id header or generates a new one
 */
@Injectable()
export class CorrelationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Use existing correlation ID from header or generate new one
    const correlationId =
      request.headers['x-correlation-id'] ||
      request.headers['x-request-id'] ||
      randomUUID();

    // Attach to request for use in other parts of the application
    request.correlationId = correlationId;

    // Add to response headers
    response.setHeader('x-correlation-id', correlationId);

    return next.handle();
  }
}


