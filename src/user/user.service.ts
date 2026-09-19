import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../auth/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ImageKitConfig } from './utils/imageKit.config';
import { GetUserDto } from './dto/getUser.dto';
import { GetUserByIdDto } from './dto/getUserById.dto';
@Injectable()
export class UserService {
  private logger = new Logger();
  constructor(
    @InjectRepository(User) private repository: Repository<User>,
    private imageKitConfig: ImageKitConfig,
  ) {}
  getMe(user: User): GetUserDto {
    const { password, ...userData } = user;

    return userData;
  }
  async getUserById(userId: string): Promise<GetUserByIdDto> {
    const user = await this.repository.findOne({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        rating: true,
        gamesPlayed: true,
        wins: true,
        losses: true,
        draws: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`user with id ${userId} was not found.`);
    }
    return user;
  }
  async deleteUser(user: User): Promise<{ message: string }> {
    const deletedUser = await this.repository.delete({ id: user.id });
    this.logger.log({ deletedUser });
    return { message: 'user Deleted Successfuly' };
  }
  async uploadImage(
    user: User,
    image: Express.Multer.File,
  ): Promise<{ message: string }> {
    const imageKitResponse = await this.imageKitConfig.uploadImage(
      image,
      user.username,
    );
    if (user.imageId) {
      await this.imageKitConfig.deleteImage(user.imageId);
    }
    user.imageId = imageKitResponse.imageId;
    user.imageUrl = imageKitResponse.imageUrl;
    user.updatedAt = new Date();
    await this.repository.save(user);
    return { message: imageKitResponse.message };
  }
  async deleteImage(user: User): Promise<{ message: string }> {
    const { imageId } = user;
    if (!imageId) {
      throw new BadRequestException(`You don't have an image to delete`);
    }
    await this.imageKitConfig.deleteImage(imageId);
    return { message: 'Image Deleted Successfuly' };
  }
}
