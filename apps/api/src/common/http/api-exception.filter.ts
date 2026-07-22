import type { IncomingMessage, ServerResponse } from 'node:http';

import {
  Catch,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { ApiError } from './api-error.js';
import type { ApiResponseMeta } from './api-response.js';

type RequestWithId = IncomingMessage & { id?: unknown };
type ResponseWithError = ServerResponse & { err?: Error };

interface ResolvedError {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: ApiResponseMeta;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(private readonly adapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.adapterHost;
    const context = host.switchToHttp();
    const request = context.getRequest<RequestWithId>();
    const response = context.getResponse<ResponseWithError>();
    const resolved = resolveError(exception);

    if (resolved.statusCode >= 500) {
      response.err =
        exception instanceof Error ? exception : new Error('Unknown error');
    }

    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: resolved.code,
        message: resolved.message,
        ...(resolved.details === undefined
          ? {}
          : { details: resolved.details }),
      },
      meta: {
        requestId: getRequestId(request),
        timestamp: new Date().toISOString(),
      },
    };

    httpAdapter.reply(response, body, resolved.statusCode);
  }
}

function resolveError(exception: unknown): ResolvedError {
  if (exception instanceof ApiError) {
    return {
      statusCode: exception.getStatus(),
      code: exception.code,
      message: exception.message,
      details: exception.details,
    };
  }

  if (exception instanceof HttpException) {
    const statusCode = exception.getStatus();

    if (statusCode >= 500) {
      return {
        statusCode,
        code: HttpStatus[statusCode] ?? 'INTERNAL_SERVER_ERROR',
        message:
          statusCode === 503 ? 'Service unavailable' : 'Internal server error',
      };
    }

    const response = exception.getResponse();
    const message = extractMessage(response, exception.message);

    return {
      statusCode,
      code: HttpStatus[statusCode] ?? 'HTTP_ERROR',
      message: message.value,
      details: message.details,
    };
  }

  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
  };
}

function extractMessage(response: string | object, fallback: string) {
  if (typeof response === 'string') {
    return { value: response };
  }

  if ('message' in response) {
    if (typeof response.message === 'string') {
      return { value: response.message };
    }

    if (
      Array.isArray(response.message) &&
      response.message.every((message) => typeof message === 'string')
    ) {
      return {
        value: 'Validation failed',
        details: { messages: response.message },
      };
    }
  }

  return { value: fallback };
}

function getRequestId(request: RequestWithId) {
  return typeof request.id === 'string' || typeof request.id === 'number'
    ? String(request.id)
    : 'unknown';
}
