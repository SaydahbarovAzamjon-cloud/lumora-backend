import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiClientService } from './ai.client';

@Module({
  imports: [HttpModule],
  providers: [AiClientService],
  exports: [AiClientService],
})
export class AiModule {}
