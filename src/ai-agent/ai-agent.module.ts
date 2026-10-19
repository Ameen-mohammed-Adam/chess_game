import { Module } from '@nestjs/common';
import { AiAgentController } from './ai-agent.controller';
import { AiAgentService } from './ai-agent.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [AiAgentController],
  providers: [AiAgentService, ConfigService],
  exports: [AiAgentService],
})
export class AiAgentModule {}
