import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GameService } from './game.service';
import { GetUser } from '../user/GetUser.decerator';
import { User } from '../auth/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { Game } from './entities/game.entity';
import { GetGameFilterDto } from './dto/get-game-filter.dto';
import { CreateGameDto } from './dto/create-game.dto';

@Controller('game')
@UseGuards(AuthGuard())
export class GameController {
  constructor(private gameService: GameService) {}

  @Get('/')
  getGames(
    @GetUser() user: User,
    @Param() getGameFilterDto: GetGameFilterDto,
  ): Promise<Game[]> {
    return this.gameService.getMyGames(user, getGameFilterDto);
  }

  @Get('/:id')
  getGameById(@Param('id') id: string, @GetUser() user: User): Promise<Game> {
    return this.gameService.getGameById(id, user);
  }

  @Post('/')
  createGame(@GetUser() user: User, @Body() createGameDto: CreateGameDto) {
    return this.gameService.createGame(user, createGameDto);
  }

  @Delete('/:id')
  deleteGame(@Param('id') id: string, @GetUser() user: User): Promise<string> {
    return this.gameService.deleteGame(id, user);
  }
}
