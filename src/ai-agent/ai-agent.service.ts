import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
@Injectable()
export class AiAgentService {
  constructor(private configService: ConfigService) {}
  async Gammea4(board: string): Promise<string> {
    const ai = new GoogleGenAI({
      apiKey: this.configService.get('GOOGLE_AI_API_KEY'),
    });

    const interaction = await ai.interactions.create({
      model: 'gemma-4-26b-a4b-it',
      input: `you are a chess player, here is the FEN for the chess game, respond with only your move as SAN. ${board} `,
    });
    console.log(interaction.output_text);
    if (!interaction.output_text)
      throw new InternalServerErrorException('Something Went Wrong');
    return interaction.output_text;
  }
}
