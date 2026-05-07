import { Module } from '@nestjs/common';
import { EventosAgendaController } from './eventos-agenda.controller';
import { EventosAgendaService } from './eventos-agenda.service';

@Module({
  controllers: [EventosAgendaController],
  providers: [EventosAgendaService],
  exports: [EventosAgendaService],
})
export class EventosAgendaModule {}
