import { createClient } from '@libsql/client';
import { Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/libsql';

import { env } from '../config/env.js';

export function createDatabase(url: string) {
  const client = createClient({ url });
  const db = drizzle({ client });

  return { client, db };
}

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  readonly client;
  readonly db;

  constructor() {
    const connection = createDatabase(env.DATABASE_URL);

    this.client = connection.client;
    this.db = connection.db;
  }

  onApplicationShutdown() {
    this.client.close();
  }
}
