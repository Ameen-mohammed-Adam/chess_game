import { IsEnum, IsOptional } from 'class-validator';
import { GameMode, GameStatus } from '../game.enums';
import { AIAgent } from '../../ai-agent/ai-agent.types';

export class GetGameFilterDto {
  @IsOptional()
  @IsEnum(GameStatus)
  status?: GameStatus;

  @IsOptional()
  @IsEnum(GameMode)
  mode?: GameMode;

  @IsOptional()
  @IsEnum(AIAgent)
  ai_Agent?: AIAgent;
}
