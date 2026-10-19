import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/user.entity';
import { Moves } from './entities/move.entity';
import { AiAgentModule } from '../ai-agent/ai-agent.module';
import { AiAgentService } from '../ai-agent/ai-agent.service';

@Module({
  imports: [
    AuthModule,
    AiAgentModule,
    TypeOrmModule.forFeature([Game, User, Moves]),
  ],
  controllers: [GameController],
  providers: [GameService, AiAgentService],
})
export class GameModule {}
