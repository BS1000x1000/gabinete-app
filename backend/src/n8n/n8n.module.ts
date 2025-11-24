import { Module } from '@nestjs/common';
import { N8nService } from './n8n.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [N8nService], 
  exports: [N8nService]
})
export class N8nModule {}
