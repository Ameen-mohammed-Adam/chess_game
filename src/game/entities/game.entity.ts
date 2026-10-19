import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/user.entity';
import { Exclude } from 'class-transformer';
import { GameMode, GameStatus, PlayerColor } from '../game.enums';
import { AIAgent } from '../../ai-agent/ai-agent.types';
import { Moves } from './move.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.games, { eager: false })
  @Exclude({ toPlainOnly: true })
  user!: User;

  @OneToMany(() => Moves, (move) => move.game, { eager: true })
  moves!: Moves[];

  @Column({ enum: GameStatus, default: GameStatus.IN_PROGRESS })
  status!: GameStatus;

  @Column({ enum: GameMode })
  mode!: GameMode;

  @Column({ enum: AIAgent })
  opponent!: AIAgent;

  @Column({ enum: PlayerColor })
  playerColor!: PlayerColor;

  @Column({
    default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  })
  gameBoard!: string;

  @Column({ enum: ['w', 'b'], default: 'w' })
  turn!: string;

  @CreateDateColumn()
  createdAt!: Date;
  @UpdateDateColumn()
  lastUpdatedAt!: Date;
}
