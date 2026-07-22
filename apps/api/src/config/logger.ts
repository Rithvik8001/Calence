import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

import type { SerializedRequest, SerializedResponse } from 'pino';
import type { Params } from 'nestjs-pino';

import { env } from './env.js';

function getRequestId(req: IncomingMessage, res: ServerResponse) {
  const incomingId = req.headers['x-request-id'];
  const requestId =
    typeof incomingId === 'string' && incomingId.length <= 128
      ? incomingId
      : randomUUID();

  res.setHeader('x-request-id', requestId);

  return requestId;
}

function isHealthRequest(req: IncomingMessage) {
  const originalUrl = (req as IncomingMessage & { originalUrl?: string })
    .originalUrl;
  const path = (originalUrl ?? req.url)?.split('?')[0];

  return path === '/api/health';
}

export const loggerConfig: Params = {
  forRoutes: ['{*path}'],
  pinoHttp: {
    name: 'calence-api',
    level: env.LOG_LEVEL,
    transport:
      env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: true,
              translateTime: 'SYS:standard',
            },
          }
        : undefined,
    autoLogging: {
      ignore: isHealthRequest,
    },
    genReqId: getRequestId,
    customLogLevel: (_req, res, error) => {
      if (error || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    customSuccessMessage: (req, res, responseTime) =>
      `${req.method} ${req.url} ${res.statusCode} ${Math.round(responseTime)}ms`,
    customErrorMessage: (req, res) =>
      `${req.method} ${req.url} ${res.statusCode} failed`,
    serializers: {
      req: (req: SerializedRequest) => ({
        id: req.id,
        method: req.method,
        url: req.url,
      }),
      res: (res: SerializedResponse) => ({
        statusCode: res.statusCode,
      }),
    },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.token',
      ],
      censor: '[REDACTED]',
    },
  },
};
