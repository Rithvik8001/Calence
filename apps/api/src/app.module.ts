import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { ApiExceptionFilter } from './common/http/api-exception.filter.js';
import { ApiResponseInterceptor } from './common/http/api-response.interceptor.js';
import { loggerConfig } from './config/logger.js';
import { HealthModule } from './modules/health/health.module.js';

@Module({
  imports: [LoggerModule.forRoot(loggerConfig), HealthModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor,
    },
  ],
})
export class AppModule {}
