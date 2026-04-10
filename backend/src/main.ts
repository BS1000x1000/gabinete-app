// ESTAS LINEAS DEBEN IR PRIMERO, ANTES DE TODO
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const REQUIRED_ENV = ['DATABASE_URL', 'SECRET', 'FRONTEND_URL'];
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Variables de entorno obligatorias no definidas: ${missing.join(', ')}`);
  }

  const app = await NestFactory.create(AppModule);

  // Necesario para que el rate limiting funcione detrás de Coolify/Nginx
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // Cookie parser (necesario para leer la cookie HttpOnly del JWT)
  app.use(cookieParser());

  const isProd = process.env.NODE_ENV === 'production';
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:4200';

  // Cabeceras de seguridad HTTP con CSP explícito
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:     ["'self'"],
        scriptSrc:      ["'self'"],
        styleSrc:       ["'self'", "'unsafe-inline'"], // Angular genera estilos inline
        imgSrc:         ["'self'", 'data:', 'blob:'],
        fontSrc:        ["'self'", 'data:'],
        connectSrc:     ["'self'", frontendUrl],
        frameSrc:       ["'none'"],
        objectSrc:      ["'none'"],
        upgradeInsecureRequests: isProd ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false, // Necesario para Puppeteer PDF
  }));

  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:4200',
    credentials: true,
  });
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log('Aplicacion corriendo en: http://localhost:' + port);
}
bootstrap();
