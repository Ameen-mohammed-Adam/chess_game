export class GetUserDto {
  id!: string;
  username!: string;
  email!: string;
  imageUrl!: string;
  rating!: number;
  createdAt!: Date;
  updatedAt!: Date;
  gamesPlayed!: number;
  wins!: number;
  losses!: number;
  draws!: number;
}
