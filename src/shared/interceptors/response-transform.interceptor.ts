import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  correlationId?: string;
}

/**
 * Response Transform Interceptor
 * Wraps all successful responses in a consistent format
 */
@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    if (context.getType() !== 'http') {
      return next.handle();
    }
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // // If response already has statusCode property, use it (for custom responses)
        // if (data && typeof data === 'object' && 'statusCode' in data) {
        //   return {
        //     ...data,
        //     timestamp: new Date().toISOString(),
        //     correlationId: request.correlationId,
        //   };
        // }

        return {
          statusCode: response.statusCode,
          message: 'Success',
          data,
          timestamp: new Date().toISOString(),
          correlationId: request.correlationId,
        };
      }),
    );
  }
}


