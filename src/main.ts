import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Allow credentials (cookies) to be shared cross-origin
  app.enableCors({
    origin: '*', // your frontend domain
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw if unknown props sent
      transform: true, // Automatically transform payloads to DTO classes
    }),
  );
  app.setGlobalPrefix('api/v1');

  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);

  console.log(`🚀 App is running on http://localhost:${port}`);
}
bootstrap();
