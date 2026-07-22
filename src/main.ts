import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const corsOrigins = configService.get<string>('CORS_ORIGINS');
  app.enableCors({
    origin: corsOrigins
      ? corsOrigins.split(',').map((o) => o.trim())
      : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const portRaw = configService.get<string>('PORT') ?? '3000';
  const port = Number.parseInt(portRaw, 10);
  await app.listen(Number.isFinite(port) ? port : 3000);
}
bootstrap();
