import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { loggerConfig } from './config/logger.js';
import { HealthModule } from './modules/health/health.module.js';

@Module({
  imports: [LoggerModule.forRoot(loggerConfig), HealthModule],
})
export class AppModule {}
