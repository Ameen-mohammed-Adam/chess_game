import { Optional } from '@nestjs/common';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column({ default: 0 })
  rating!: number;

  @Optional()
  @Column({ default: '' })
  image?: string;

  // //each user Can have multiple games
  // @Column()
  // games!: string;

  // //each user can have multiple friends
  // @Column()
  // friends!: uuid;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
