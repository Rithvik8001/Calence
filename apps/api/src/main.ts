import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { env } from './config/env.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  app.setGlobalPrefix('api');

  await app.listen(env.PORT);
}

void bootstrap();
