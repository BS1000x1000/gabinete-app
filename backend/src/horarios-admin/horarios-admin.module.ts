import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { HorariosAdminController } from './horarios-admin.controller';
import { HorariosAdminService } from './horarios-admin.service';

@Module({
  imports: [PrismaModule],
  controllers: [HorariosAdminController],
  providers: [HorariosAdminService],
})
export class HorariosAdminModule {}
