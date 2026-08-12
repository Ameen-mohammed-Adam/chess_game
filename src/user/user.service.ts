import { Injectable } from '@nestjs/common';
import { User } from '../auth/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ImageKitConfig } from './utils/imageKit.config';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private repository: Repository<User>,
    private imageKitConfig: ImageKitConfig,
  ) {}
  async uploadImage(
    user: User,
    image: Express.Multer.File,
  ): Promise<{ message: string }> {
    const imageKitResponse = await this.imageKitConfig.uploadImage(
      image,
      user.username,
    );
    user.image = imageKitResponse.url;
    user.updatedAt = new Date();
    await this.repository.save(user);
    console.log(user);
    return { message: imageKitResponse.message };
  }
}
