import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import session from 'express-session';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const corsOriginsRaw = process.env.CORS_ORIGIN!;
  const corsOrigins = corsOriginsRaw.split(',');

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: corsOrigins,
      credentials: true,
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());

  const configService = app.get(ConfigService);

  app.use(
    session({
      secret: configService.get('SESSION_SECRET')!,
      resave: false,
      saveUninitialized: false,
    }),
  );

  // Only enable Swagger in development
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Buy purchasing powers')
      .setDescription('Buy purchasing powers API description')
      .setVersion('0.0.1')
      .addTag('Buy purchasing powers')
      .addBearerAuth()
      .addCookieAuth()
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, documentFactory);
  }

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
