import { Body, Controller, Post } from '@nestjs/common';
import { CreatUserDto } from './dto/create-User.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/signup')
  async signUp(
    @Body() createUserDto: CreatUserDto,
  ): Promise<{ message: string }> {
    return this.authService.signUp(createUserDto);
  }
  @Post('/login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(email, password);
  }
}
