import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { randomUUID } from 'crypto';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    { bufferLogs: true }
  );

  app.useLogger(app.get(Logger))

  app.use((req,res,next) => {
    const id = randomUUID();
    req.headers['x-request-id'] = id;
    res.setHeader('X-Request-Id', id);
    next();
  })

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT');
  const frontend = config.get<string>('FRONTEND_URL');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));

  app.enableCors({
    origin: [frontend, 'http://localhost:4200', 'http://localhost:3001'],
    credentials: true,
  });
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    // ili join(__dirname, '..', 'uploads')
    prefix: '/uploads', // <-- ruta mora da se poklapa s onim što frontend traži
  });

  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Flowzen API')
      .setDescription('Salon & clinic management backend')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
      .build();
    const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, swaggerDoc);
  }


  await app.listen(port);
}
bootstrap();
