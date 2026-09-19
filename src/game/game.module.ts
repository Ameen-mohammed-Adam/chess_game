import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './game.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/user.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Game, User])],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
