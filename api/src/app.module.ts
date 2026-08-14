import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { awsConfig } from './config/aws.config';
import { appConfigSchema } from './config/config.types';
import { databaseConfig } from './config/database.config';
import { DocumentsModule } from './modules/documents/documents.module';
import { appConfig } from './config/app.config';
import { DatabaseModule } from './modules/database/database.module';
import { SearchModule } from './modules/search/search.module';
import { SseModule } from './modules/sse/sse.module';
import { SqsWorkerModule } from './modules/sqs-worker/sqs-worker.module';
import { StorageModule } from './modules/storage/storage.module';
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, awsConfig, appConfig],
      validationSchema: appConfigSchema,
    }),
    DatabaseModule,
    DocumentsModule,
    StorageModule,
    SearchModule,
    SseModule,
    SqsWorkerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
