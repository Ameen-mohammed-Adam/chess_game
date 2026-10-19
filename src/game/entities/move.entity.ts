import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from './game.entity';

@Entity()
export class Moves {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Game, (game) => game.moves, {
    eager: false,
    nullable: false,
  })
  game!: Game;

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
