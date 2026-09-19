import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../auth/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game, GameStatus } from './game.entity';

@Injectable()
export class GameService {
  private logger = new Logger();
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Game) private gameRepository: Repository<Game>,
  ) {}

  async getMyGames(user: User): Promise<Game[]> {
    const query = this.gameRepository.createQueryBuilder();
    query.where({ user });

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
  async createGame(user: User) {
    // let game = await this.gameRepository.findOne({
    //   where: { status: GameStatus.IN_PROGRESS, user: { id: user.id } },
    // });
    // if (game) {
    //   return game;
    // }
    const game = this.gameRepository.create({
      user,
    });
    await this.gameRepository.save(game);
    user.gamesPlayed += 1;
    user.games.push(game);
    await this.userRepository.save(user);
    return game;
  }
}
