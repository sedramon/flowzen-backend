import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://your-vercel-app.vercel.app'
    ],
    credentials: true
  });
  app.useStaticAssets(join(process.cwd(), 'uploads'), {  // ili join(__dirname, '..', 'uploads')
    prefix: '/uploads',           // <-- ruta mora da se poklapa s onim što frontend traži
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
