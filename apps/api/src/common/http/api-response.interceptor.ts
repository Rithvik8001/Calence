import type { IncomingMessage } from 'node:http';

import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';

import { ApiResponse } from './api-response.js';

type RequestWithId = IncomingMessage & { id?: unknown };

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<RequestWithId>();

    return next.handle().pipe(
      map(
        (data) =>
          new ApiResponse(data, {
            requestId: getRequestId(request),
            timestamp: new Date().toISOString(),
          }),
      ),
    );
  }
}

function getRequestId(request: RequestWithId) {
  return typeof request.id === 'string' || typeof request.id === 'number'
    ? String(request.id)
    : 'unknown';
}
