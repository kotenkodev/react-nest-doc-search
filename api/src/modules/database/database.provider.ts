import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DRIZZLE, PG_POOL } from './database.constants';
import * as schema from './schema';

export type Database = ReturnType<typeof drizzle<typeof schema>>;

export const poolProvider: Provider = {
  provide: PG_POOL,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new Pool({
      host: configService.get<string>('database.host'),
      port: configService.get<number>('database.port'),
      user: configService.get<string>('database.username'),
      password: configService.get<string>('database.password'),
      database: configService.get<string>('database.database'),
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  },
};

export const databaseProvider: Provider = {
  provide: DRIZZLE,
  inject: [PG_POOL],
  useFactory: (pool: Pool) => {
    return drizzle(pool, { schema });
  },
};
