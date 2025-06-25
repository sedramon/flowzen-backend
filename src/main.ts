import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // pull in your env vars
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3000);
  const frontend = config.get<string>('FRONTEND_URL');

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: [frontend],
    credentials: true,
  });
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    // ili join(__dirname, '..', 'uploads')
    prefix: '/uploads', // <-- ruta mora da se poklapa s onim što frontend traži
  });
  
  await app.listen(port);
}
bootstrap();
