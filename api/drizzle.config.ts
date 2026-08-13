import { defineConfig } from 'drizzle-kit';
import { databaseConfig } from 'src/config/database.config';

const dbConfig = databaseConfig();

export default defineConfig({
  schema: './src/modules/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    ssl: false,
  },
});
