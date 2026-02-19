import { Module } from '@nestjs/common';
import { AreasDesarrolloController } from './areas-desarrollo.controller';
import { AreasDesarrolloService } from './areas-desarrollo.service';

@Module({
  controllers: [AreasDesarrolloController],
  providers: [AreasDesarrolloService],
  exports: [AreasDesarrolloService],
})
export class AreasDesarrolloModule {}