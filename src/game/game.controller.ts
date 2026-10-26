import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GameService } from './game.service';
import { GetUser } from '../user/GetUser.decerator';
import { User } from '../auth/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { Game } from './entities/game.entity';
import { GetGameFilterDto } from './dto/get-game-filter.dto';
import { CreateGameDto } from './dto/create-game.dto';
import { MakeMoveDto } from './dto/make-move.dto';

@Controller('game')
@UseGuards(AuthGuard())
export class GameController {
  constructor(private gameService: GameService) {}

  @Get('/')
  getGames(@GetUser() user: User, @Query() getGameFilterDto: GetGameFilterDto) {
    return this.gameService.getMyGames(user, getGameFilterDto);
  }

  @Get('/:id')
  getGameById(@Param('id') id: string, @GetUser() user: User) {
    return this.gameService.getGameById(id, user);
  }

  @Post('/')
  createGame(@GetUser() user: User, @Body() createGameDto: CreateGameDto) {
    return this.gameService.createGame(user, createGameDto);
  }

  @Delete('/:id')
  deleteGame(@Param('id') id: string, @GetUser() user: User) {
    return this.gameService.deleteGame(id, user);
  }

  @Post('/:id/moves')
  makeMove(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() makeMoveDto: MakeMoveDto,
  ) {
    return this.gameService.makeMove(makeMoveDto, id, user);
  }

  @Delete('/:id/abandon')
  abandonGame(@Param('id') id: string, @GetUser() user: User) {
    return this.gameService.abandonGame(id, user);
  }

  @Post('/:id/resign')
  resignGame(@Param('id') id: string, @GetUser() user: User) {
    return this.gameService.resign(id, user);
  }
}
