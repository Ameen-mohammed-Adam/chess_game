import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from './game.entity';

@Entity()
export class Move {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Game, (game) => game.moves, { eager: false })
  gameId!: Game[];

  @Column()
  from!: string;

  @Column()
  to!: string;

  @Column()
  san!: string;

  @Column()
  playedBy!: string;

  @Column({ default: new Date() })
  createdAt!: Date;
}
