import {
  BadRequestException,
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
    const query = this.gameRepository.createQueryBuilder();
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

  async deleteGame(id: string, user: User): Promise<string> {
    const result = await this.gameRepository.delete({
      id,
      user: { id: user.id },
    });

    if (result.affected === 0) {
      return `Game with id: ${id} was not found. `;
    }
    return `Game deleted successfully`;
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
    await this.gameRepository.save(newGame);
    user.gamesPlayed += 1;
    user.games.push(newGame);
    await this.userRepository.save(user);
    return newGame;
  }

  async makeMove(
    makeMoveDto: MakeMoveDto,
    gameId: string,
    user: User,
  ): Promise<
    | { gameBoard: string; turn: string }
    | { message: string; GameResult: string }
  > {
    //make sure the game does exist
    const { from, to, san, promotion = undefined } = makeMoveDto || {};
    if (!from || !to || !san) {
      throw new BadRequestException(
        'make sure to add from, to and san. indicating where from the peice moved, to where did it go and the san ',
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
      //making the user move and creating it
      const chessTester = new Chess(game.gameBoard);
      chessTester.move({ from, to, promotion });
      const PlayerMove = this.moveRepository.create({
        game,
        from,
        to,
        san,
        playedBy: `${user.username}`,
      });

      // check if the game is over after Player Move
      if (chessTester.isGameOver()) {
        game.gameBoard = chessTester.fen();
        game.turn = chessTester.turn();
        await this.gameRepository.save(game);
        await this.moveRepository.save(PlayerMove);

        if (chessTester.isCheckmate()) {
          const Winner = chessTester.turn() === 'b' ? 'WHITE' : 'BLACK';
          game.status = GameStatus.WIN;
          return { message: 'Good Game', GameResult: `${Winner} Won.` };
        }
        if (chessTester.isDraw()) {
          game.status = GameStatus.DRAW;
          return { message: `Nice Try, It's a Draw`, GameResult: 'Draw' };
        }
        if (chessTester.isStalemate()) {
          game.status = GameStatus.STALEMATE;
          return { message: `StaleMate.`, GameResult: 'StaleMate' };
        }
      }

      //create Ai's Move
      let aiMove: string | null = null;
      switch (game.opponent) {
        case AIAgent.GEMMEA:
          aiMove = await this.aiAgentService.Gammea4(chessTester.fen());
          break;

        default:
          throw new BadRequestException(
            `Unsupported opponent: ${game.opponent}`,
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

      // check if the game is over after Ai Move
      if (chessTester.isGameOver()) {
        game.gameBoard = chessTester.fen();
        game.turn = chessTester.turn();
        await this.gameRepository.save(game);
        await this.moveRepository.save([PlayerMove, aiMve]);

        if (chessTester.isCheckmate()) {
          const Winner = chessTester.turn() === 'b' ? 'WHITE' : 'BLACK';
          game.status = GameStatus.LOST;
          return { message: 'Good Game', GameResult: `${Winner} Won.` };
        }
        if (chessTester.isDraw()) {
          game.status = GameStatus.DRAW;
          return { message: `Nice Try, It's a Draw`, GameResult: 'Draw' };
        }
        if (chessTester.isStalemate()) {
          game.status = GameStatus.STALEMATE;
          return { message: `StaleMate.`, GameResult: 'StaleMate' };
        }
      }

      // saving everything
      game.gameBoard = chessTester.fen();
      game.turn = chessTester.turn();
      await this.gameRepository.save(game);
      await this.moveRepository.save([PlayerMove, aiMve]);
      return { gameBoard: game.gameBoard, turn: game.turn };
    } catch (error) {
      this.logger.error(
        `${(error as Error)?.message}`,
        (error as Error)?.stack,
      );
      if ((error as Error).message.includes('Invalid move: ')) {
        throw new BadRequestException(`Imvalid Move made: ${makeMoveDto.san}`);
      }
      throw new InternalServerErrorException();
    }
  }
}
