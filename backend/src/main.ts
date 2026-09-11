// ESTAS LINEAS DEBEN IR PRIMERO, ANTES DE TODO
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');

/**
 * Comprobaciones de arranque.
 *
 * En produccion se exige ademas la configuracion de Object Storage: sin ella
 * `StorageService` arranca en modo `none` y el archivado de PDF de informes se
 * queda en un `warn` silencioso. Un contenedor que arranca "bien" y no persiste
 * documentos clinicos es peor que uno que no arranca.
 *
 * El correo (`SCW_TEM_PROJECT_ID`, `SCW_TEM_SECRET_KEY`, `EMAIL_FROM`) queda
 * FUERA de las obligatorias a proposito: Scaleway Transactional Email exige un
 * dominio verificado y todavia no hay dominio, asi que exigirlas hoy impediria
 * arrancar el contenedor. `EmailService` entra en modo no-op y avisa por log.
 * TODO: en cuanto el dominio este verificado en TEM, moverlas al bloque
 * `if (isProd)` de aqui abajo — mientras no se haga, una factura que no sale
 * por falta de configuracion solo se ve en los logs.
 */
function comprobarEntorno(): void {
  const isProd = process.env.NODE_ENV === 'production';

  const requeridas = ['DATABASE_URL', 'SECRET', 'FRONTEND_URL'];
  if (isProd) {
    requeridas.push('SCW_ACCESS_KEY', 'SCW_SECRET_KEY', 'SCW_BUCKET_NAME');
  }

  const missing = requeridas.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Variables de entorno obligatorias no definidas: ${missing.join(', ')}`);
  }

  // `SECRET` firma todas las sesiones: comprobar que existe no basta.
  if (isProd && (process.env.SECRET as string).length < 32) {
    throw new Error('SECRET debe tener al menos 32 caracteres en producción');
  }

  // El cifrado en transito contra la BD dependia por completo de que la cadena
  // estuviera bien escrita a mano, sin que nada lo comprobara.
  if (isProd && !/[?&]sslmode=/.test(process.env.DATABASE_URL as string)) {
    throw new Error(
      'DATABASE_URL debe declarar sslmode (p. ej. ?sslmode=require) en producción',
    );
  }
}

async function bootstrap() {
  comprobarEntorno();

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
  
  const port = process.env.PORT ?? 8080;
  await app.listen(port, '0.0.0.0');
  new Logger('Bootstrap').log(`Aplicacion corriendo en: http://0.0.0.0:${port}`);
}
bootstrap();
