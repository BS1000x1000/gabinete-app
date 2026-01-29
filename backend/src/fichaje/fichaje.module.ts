import { Module } from '@nestjs/common';
import { FichajeService } from './fichaje.service';
import { FichajeController } from './fichaje.controller';

@Module({
  controllers: [FichajeController],
  providers: [FichajeService]
})
export class FichajeModule {}
