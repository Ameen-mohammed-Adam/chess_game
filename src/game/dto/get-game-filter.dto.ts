import { IsEnum, IsOptional } from 'class-validator';
import { GameMode, GameStatus } from '../game.entity';
import { AIAgent } from '../../ai-agent/ai-agent.types';

export class GetGameFilter {
  @IsEnum(GameStatus)
  status!: GameStatus;

  @IsOptional()
  @IsEnum(GameMode)
  mode?: GameMode;

  @IsEnum(AIAgent)
  ai_Agent!: AIAgent;
}
