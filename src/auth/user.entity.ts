import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  username!: string;

  @Column()
  password!: string;

  @Column()
  email!: string;

  @Column()
  rating!: number;

  //each user Can have multiple games
  @Column()
  games!: string;

  //each user can have multiple friends
  @Column()
  friends!: string;
}
