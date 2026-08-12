import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/user.entity';
import { ImageKitConfig } from './utils/imageKit.config';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([User])],
  providers: [UserService, ImageKitConfig],
  controllers: [UserController],
})
export class UserModule {}
