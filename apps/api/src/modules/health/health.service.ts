import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import { DatabaseService } from '../../database/database.service.js';

@Injectable()
export class HealthService {
  constructor(private readonly database: DatabaseService) {}

  async check() {
    const timestamp = new Date().toISOString();

    try {
      await this.database.client.execute('select 1');

      return {
        status: 'ok',
        timestamp,
        uptimeSeconds: Math.floor(process.uptime()),
        checks: {
          database: 'up',
        },
      } as const;
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        timestamp,
        checks: {
          database: 'down',
        },
      });
    }
  }
}
