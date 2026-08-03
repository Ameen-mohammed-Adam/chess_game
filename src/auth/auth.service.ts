import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatUserDto } from './dto/create-User.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User) private repository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async signUp(createUserDto: CreatUserDto): Promise<string> {
    const { username, password, email, confirm_password } = createUserDto || 0;
    if (!username || !password || !email || !confirm_password) {
      this.logger.verbose(createUserDto);
      throw new BadRequestException(
        'make sure all of these are not empty username, email, password, confirm_password',
      );
    }
    if (password !== confirm_password) {
      throw new BadRequestException(
        'Password and confirm_password are not the same',
      );
    }
    const confirm_email_Exists = await this.repository.find({
      where: { email },
    });
    if (confirm_email_Exists.length) {
      this.logger.verbose(`the email (${email}) already exists.`);
      throw new BadRequestException('This email Already Exists.');
    }
    const confirm_username_Exists = await this.repository.find({
      where: { username },
    });
    if (confirm_username_Exists.length) {
      this.logger.verbose(`username ${username} Already Exists.`);
      throw new BadRequestException('This username Already Exists.');
    }
    const user = this.repository.create({ username, password, email });
    try {
      await this.repository.save(user);
    } catch (error) {
      this.logger.error('something Went Wrong', error);
      return 'Error Something Went Wrong';
    }
    return 'SingUp SuccessFull.';
  }
}
