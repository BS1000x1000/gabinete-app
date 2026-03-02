import { Module } from '@nestjs/common';
import { BonosController } from './bonos.controller';
import { BonosService } from './bonos.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BonosController],
  providers: [BonosService],
  exports: [BonosService], // ← exportar para que SesionesModule lo inyecte
})
export class BonosModule {}