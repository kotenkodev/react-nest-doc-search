import * as Joi from 'joi';
import { AppConfig } from './app.config';
import { AWSConfig } from './aws.config';
import { DatabaseConfig } from './database.config';

export interface ConfigType {
  app: AppConfig;
  database: DatabaseConfig;
  aws: AWSConfig;
}

export const appConfigSchema: Joi.ObjectSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),

  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().empty('').default('postgres'),
  DB_PASSWORD: Joi.string().empty('').default('postgres'),
  DB_NAME: Joi.string().empty('').default('tasks'),
  DB_SYNC: Joi.boolean().default(false),

  AWS_BUCKET_NAME: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),

  AWS_SQS_QUEUE_URL: Joi.string().required(),

  OPENSEARCH_NODE: Joi.string().default('http://localhost:9200'),
  OPENSEARCH_AUTH_USERNAME: Joi.string().allow('').optional(),
  OPENSEARCH_AUTH_PASSWORD: Joi.string().allow('').optional(),
});
