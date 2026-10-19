import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MakeMoveDto {
  @IsNotEmpty()
  from!: string;
  @IsNotEmpty()
  to!: string;
  @IsNotEmpty()
  san!: string;
  @IsOptional()
  @IsString()
  promotion!: string;
}
