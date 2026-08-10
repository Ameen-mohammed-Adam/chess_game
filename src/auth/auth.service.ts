import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatUserDto } from './dto/create-User.dto';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './dto/jwt-payload.dto';
@Injectable()
export class AuthService {
  logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User) private repository: Repository<User>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async signUp(createUserDto: CreatUserDto): Promise<{ message: string }> {
    const { username, password, email, confirmPassword } = createUserDto || {};
    if (!username || !password || !email || !confirmPassword) {
      throw new BadRequestException(
        'make sure all of these are not empty username, email, password, confirmPassword',
      );
    }
    if (password !== confirmPassword) {
      throw new BadRequestException(
        'Password and confirmPassword are not the same',
      );
    }
    const salt = Number(this.configService.get('BCRYPT_SALT')) || 12;
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = this.repository.create({
      username,
      password: hashedPassword,
      email,
      rating: 0,
    });
    try {
      await this.repository.save(user);
    } catch (error) {
      this.logger.error('something went wrong', error);
      if ((error as QueryFailedError & { code?: string }).code === '23505') {
        throw new ConflictException('Username or Email Already Exists.');
      }
      throw new InternalServerErrorException('Error Something Went Wrong');
    }
    return { message: 'Signup Successfull.' };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.repository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException(`email or password are incorrect`);
    }
    const verifyPassword = await bcrypt.compare(password, user.password);
    if (!verifyPassword) {
      throw new UnauthorizedException(`email or password are incorrect`);
    }
    const payload: JwtPayload = { username: user.username, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRESIN'),
    });
    return { accessToken };
  }
}
