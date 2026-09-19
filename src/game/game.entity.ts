import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../auth/user.entity';
import { Exclude } from 'class-transformer';

export enum GameStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDODNED = 'ABANDODNED',
}

export enum GameMode {
  VS_AI = 'VS_AI',
  VS_PLAYER = 'VS_PLAYER',
}

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: '' })
  moves?: string;

  @Column({ default: GameStatus.IN_PROGRESS })
  status?: GameStatus;

  @ManyToOne(() => User, (user) => user.games, { eager: false })
  @Exclude({ toPlainOnly: true })
  user!: User;

  @Column({ default: new Date() })
  createdAt!: Date;
  @Column({ default: new Date() })
  lastUpdateAt!: Date;
}
