// ✅ ESTAS LÍNEAS DEBEN IR PRIMERO, ANTES DE TODO
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Debug: verifica que SECRET se cargó
  console.log('🔑 SECRET cargado:', process.env.SECRET ? 'SÍ ✅' : 'NO ❌');
  console.log('💾 DATABASE_URL cargado:', process.env.DATABASE_URL ? 'SÍ ✅' : 'NO ❌');

  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Aplicación corriendo en: http://localhost:${port}`);
}
bootstrap();