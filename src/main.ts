import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Ako hocemo globalne validacije
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: ['http://localhost:4200',
    'https://your-vercel-app.vercel.app'],
    credentials: true
});
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
