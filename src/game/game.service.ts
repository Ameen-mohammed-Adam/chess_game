import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../auth/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './entities/game.entity';
import { GetGameFilterDto } from './dto/get-game-filter.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { GameStatus } from './game.enums';
import { Chess } from 'chess.js';
import { Moves } from './entities/move.entity';
import { MakeMoveDto } from './dto/make-move.dto';
import { AiAgentService } from '../ai-agent/ai-agent.service';
import { AIAgent } from '../ai-agent/ai-agent.types';

type MakeMoveResult = {
  message: string;
  data: {
    gameBoard: string;
    turn: string;
    status: GameStatus;
    gameResult?: string;
  };
};
@Injectable()
export class GameService {
  private logger = new Logger();
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Game) private gameRepository: Repository<Game>,
    @InjectRepository(Moves) private moveRepository: Repository<Moves>,
    private aiAgentService: AiAgentService,
  ) {}

  async getMyGames(
    user: User,
    getGameFilterDto: GetGameFilterDto,
  ): Promise<Game[]> {
    const query = this.gameRepository.createQueryBuilder('game');
    query.where({ user });
    const { status, mode } = getGameFilterDto;
    if (status) {
      query.andWhere('game.status LIKE :status', { status: `%${status}%` });
    }
    if (mode) {
      const upperModer = mode.toUpperCase();
      query.andWhere('game.mode LIKE :mode', { mode: `%${upperModer}%` });
    }
    try {
      const games = await query.getMany();
      return games;
    } catch (error) {
      this.logger.error(
        `something went wrong with user ${user.username}.`,
        (error as Error)?.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async getGameById(id: string, user: User): Promise<Game> {
    const game = await this.gameRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!game) {
      throw new NotFoundException(`Game with Id: ${id} was not found.`);
    }
    return game;
  }

  async deleteGame(
    id: string,
    user: User,
  ): Promise<{ message: string; data: null }> {
    const result = await this.gameRepository.delete({
      id,
      user: { id: user.id },
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Game with id: ${id} was not found. `);
    }
    return { message: `Game deleted successfully`, data: null };
  }
  async createGame(user: User, createGameDto: CreateGameDto): Promise<Game> {
    const game = await this.gameRepository.findOne({
      where: { status: GameStatus.IN_PROGRESS, user: { id: user.id } },
    });
    if (game) {
      return game;
    }
    const { mode, ai_Agent, playerColor } = createGameDto || {};
    if (!mode || !ai_Agent || !playerColor) {
      throw new BadRequestException(
        'make sure mode , ai_Agent and playerColor exist.',
      );
    }
    const newGame = this.gameRepository.create({
      user,
      playerColor,
      mode,
      opponent: ai_Agent,
    });
    user.gamesPlayed += 1;
    await this.gameRepository.save(newGame);
    await this.userRepository.save(user);
    return newGame;
  }

  async makeMove(
    makeMoveDto: MakeMoveDto,
    gameId: string,
    user: User,
  ): Promise<MakeMoveResult> {
    const { from, to, san, promotion = undefined } = makeMoveDto || {};
    if (!from || !to || !san) {
      throw new BadRequestException(
        'make sure to add from, to and san. indicating where from the piece moved, to where did it go and the san ',
      );
    }
    const game = await this.gameRepository.findOne({
      where: { id: gameId, user: { id: user.id } },
    });
    if (!game) {
      throw new NotFoundException(`Game with id: ${gameId} was not found.`);
    }
    if (game.status !== GameStatus.IN_PROGRESS) {
      throw new BadRequestException("you can't make moves to this game");
    }

    try {
      // player move
      const chessTester = new Chess(game.gameBoard);
      const testMove = chessTester.move({ from, to, promotion });
      const playerMove = this.moveRepository.create({
        game,
        from: testMove.from,
        to: testMove.to,
        san: testMove.san,
        playedBy: `${user.username}`,
      });

      // game over after player move
      if (chessTester.isGameOver()) {
        const winner = chessTester.turn() === 'b' ? 'WHITE' : 'BLACK';
        let message: string;
        let gameResult: string;

        if (chessTester.isCheckmate()) {
          game.status = GameStatus.WIN;
          message = 'Good Game';
          gameResult = `${winner} Won.`;
        } else if (chessTester.isStalemate()) {
          // must be checked before isDraw(), which also returns true for stalemate
          game.status = GameStatus.STALEMATE;
          message = 'Stalemate.';
          gameResult = 'Stalemate';
        } else {
          game.status = GameStatus.DRAW;
          message = `Nice Try, It's a Draw`;
          gameResult = 'Draw';
        }

        game.gameBoard = chessTester.fen();
        game.turn = chessTester.turn();
        await this.gameRepository.save(game);
        await this.moveRepository.save(playerMove);

        return {
          message,
          data: {
            gameBoard: game.gameBoard,
            turn: game.turn,
            status: game.status,
            gameResult,
          },
        };
      }

      // AI move
      let aiMove: string | null = null;
      switch (game.opponent) {
        case AIAgent.GEMMEA:
          aiMove = await this.aiAgentService.Gammea4(chessTester.fen());
          break;
        default:
          throw new BadRequestException(
            `Unsupported opponent: ${String(game.opponent)}`,
          );
      }
      const move = chessTester.move(aiMove, { strict: false });
      const aiMve = this.moveRepository.create({
        game,
        from: move.from,
        to: move.to,
        san: move.san,
        playedBy: `${game.opponent}`,
      });

      // game over after AI move
      if (chessTester.isGameOver()) {
        const winner = chessTester.turn() === 'b' ? 'WHITE' : 'BLACK';
        let message: string;
        let gameResult: string;

        if (chessTester.isCheckmate()) {
          game.status = GameStatus.LOST;
          message = 'Good Game';
          gameResult = `${winner} Won.`;
        } else if (chessTester.isStalemate()) {
          game.status = GameStatus.STALEMATE;
          message = 'Stalemate.';
          gameResult = 'Stalemate';
        } else {
          game.status = GameStatus.DRAW;
          message = `Nice Try, It's a Draw`;
          gameResult = 'Draw';
        }

        game.gameBoard = chessTester.fen();
        game.turn = chessTester.turn();
        await this.gameRepository.save(game);
        await this.moveRepository.save([playerMove, aiMve]);

        return {
          message,
          data: {
            gameBoard: game.gameBoard,
            turn: game.turn,
            status: game.status,
            gameResult,
          },
        };
      }

      // game continues
      game.gameBoard = chessTester.fen();
      game.turn = chessTester.turn();
      await this.gameRepository.save(game);
      await this.moveRepository.save([playerMove, aiMve]);

      return {
        message: 'Move played',
        data: {
          gameBoard: game.gameBoard,
          turn: game.turn,
          status: game.status,
        },
      };
    } catch (error) {
      // let Nest exceptions (e.g. "Unsupported opponent") pass through untouched
      if (error instanceof HttpException) throw error;

      this.logger.error(
        `${(error as Error)?.message}`,
        (error as Error)?.stack,
      );
      if ((error as Error).message.includes('Invalid move: ')) {
        throw new BadRequestException(`Invalid move made: ${makeMoveDto.san}`);
      }
      throw new InternalServerErrorException();
    }
  }

  async abandonGame(
    gameId: string,
    user: User,
  ): Promise<{ message: string; data: null }> {
    const game = await this.getGameById(gameId, user);
    if (game.moves.length >= 2) {
      throw new BadRequestException(
        `since you made a move, you can only Resign this game.`,
      );
    }
    await this.deleteGame(game.id, user);
    return { message: 'Game Abandoned', data: null };
  }
  async resign(
    gameId: string,
    user: User,
  ): Promise<{ message: string; data: null }> {
    const game = await this.getGameById(gameId, user);
    if (game.status !== GameStatus.IN_PROGRESS) {
      throw new BadRequestException(`You can't resign this game`);
    }
    game.status = GameStatus.LOST;
    await this.gameRepository.save(game);

    return { message: 'Game Resigned Successfully', data: null };
  }
}
