import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { MotorReglasService } from '../../src/notificaciones/motor-reglas.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ResponseInterceptor } from '../../src/common/interceptors/response.interceptor';
import { AllExceptionsFilter } from '../../src/common/filters/http-exception.filter';
import { PrismaMock } from './prisma-mock';

/**
 * Crea una instancia de la app NestJS configurada exactamente igual que main.ts
 * pero con PrismaService y MotorReglasService mockeados (sin DB real).
 */
export async function createTestApp(prismaMock: PrismaMock): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(prismaMock)
    .overrideProvider(MotorReglasService)
    .useValue({ evaluarReglas: jest.fn().mockResolvedValue(undefined) })
    .overrideGuard(ThrottlerGuard)
    .useValue({ canActivate: () => true })
    .compile();

  const app = moduleFixture.createNestApplication();

  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  return app;
}
