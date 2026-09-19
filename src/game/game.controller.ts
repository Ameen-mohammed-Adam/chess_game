import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import { GetUser } from '../user/GetUser.decerator';
import { User } from '../auth/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { Game } from './game.entity';

@Controller('game')
@UseGuards(AuthGuard())
export class GameController {
  constructor(private gameService: GameService) {}

  @Get('/')
  getGames(@GetUser() user: User): Promise<Game[]> {
    return this.gameService.getMyGames(user);
  }

  @Get('/:id')
  getGameById(@Param('id') id: string, @GetUser() user: User): Promise<Game> {
    return this.gameService.getGameById(id, user);
  }

  @Post('/')
  createGame(@GetUser() user: User) {
    return this.gameService.createGame(user);
  }
}
