import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common/pipes';
import { type AppConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
}
void bootstrap();
