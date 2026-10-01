import { IsEnum } from 'class-validator';
import { AIAgent } from '../../ai-agent/ai-agent.types';
import { GameMode, PlayerColor } from '../game.enums';

export class CreateGameDto {
  @IsEnum(GameMode)
  mode!: GameMode;
  @IsEnum(PlayerColor)
  playerColor!: PlayerColor;
  @IsEnum(AIAgent)
  ai_Agent!: AIAgent;
}
