import { HttpException, type HttpStatus } from '@nestjs/common';

export interface ApiErrorOptions {
  statusCode: HttpStatus;
  code: string;
  message: string;
  details?: unknown;
  cause?: unknown;
}

export class ApiError extends HttpException {
  readonly code: string;
  readonly details?: unknown;

  constructor({ statusCode, code, message, details, cause }: ApiErrorOptions) {
    super(message, statusCode, { cause });

    this.code = code;
    this.details = details;
  }
}
