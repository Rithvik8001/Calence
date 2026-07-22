import { HttpStatus, Injectable } from '@nestjs/common';

import { ApiError } from '../../common/http/api-error.js';
import { DatabaseService } from '../../database/database.service.js';

@Injectable()
export class HealthService {
  constructor(private readonly database: DatabaseService) {}

  async check() {
    try {
      await this.database.client.execute('select 1');

      return {
        status: 'ok',
        uptimeSeconds: Math.floor(process.uptime()),
        checks: {
          database: 'up',
        },
      } as const;
    } catch {
      throw new ApiError({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        code: 'DATABASE_UNAVAILABLE',
        message: 'API is unavailable',
        details: {
          checks: {
            database: 'down',
          },
        },
      });
    }
  }
}
