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
@Injectable()
export class GameService {
  private logger = new Logger();
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Game) private gameRepository: Repository<Game>,
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
  async createGame(user: User, createGameDto: CreateGameDto) {
    const game = await this.gameRepository.findOne({
      where: { status: GameStatus.IN_PROGRESS, user: { id: user.id } },
    });
    if (game) {
      return game;
    }
    const { mode, ai_Agent, playerColor } = createGameDto || {};
    if (!mode || !ai_Agent || !playerColor) {
      console.log(mode, ai_Agent, playerColor);
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
    return game;
  }
}
