import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter';
import { Logger, ValidationPipe } from '@nestjs/common';
import { type AppConfig } from './config/app.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  const configService = app.get(ConfigService);

  const corsOrigin =
    configService.get<string>('app.cors') || 'http://localhost:5173';

  app.enableCors({
    origin: corsOrigin.split(','),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const appConfiguration = configService.get<AppConfig>('app');
  app.useGlobalFilters(new GlobalExceptionFilter(appConfiguration!));

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
void bootstrap();
