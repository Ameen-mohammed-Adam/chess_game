import { Body, Controller, Post } from '@nestjs/common';
import { CreatUserDto } from './dto/create-User.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/signup')
  async singUp(@Body() createUserDto: CreatUserDto): Promise<string> {
    return this.authService.signUp(createUserDto);
  }
}
