import { Module, OnModuleDestroy, Inject, Global } from '@nestjs/common';
import { Pool } from 'pg';
import { databaseProvider, poolProvider } from './database.provider';
import { PG_POOL } from './database.constants';

@Global()
@Module({
  providers: [poolProvider, databaseProvider],
  exports: [databaseProvider],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
