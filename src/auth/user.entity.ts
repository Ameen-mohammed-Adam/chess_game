import { Optional } from '@nestjs/common';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Game } from '../game/game.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ default: 0, type: 'int' })
  rating!: number;

  @Optional()
  @Column({ default: null })
  imageUrl!: string;

  @Optional()
  @Column({ default: null })
  imageId?: string;

  @Column({ default: 0, type: 'int' })
  gamesPlayed!: number;

  @Column({ default: 0, type: 'int' })
  wins!: number;

  @Column({ default: 0, type: 'int' })
  losses!: number;

  @Column({ default: 0, type: 'int' })
  draws!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Game, (game) => game.user, { eager: true })
  games!: Game[];
}
