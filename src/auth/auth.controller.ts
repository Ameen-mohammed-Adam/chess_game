import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreatUserDto } from './dto/create-User.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

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

  @UseGuards(AuthGuard())
  @Post('lol')
  fun(@Req() req) {
    console.log(req);
  }
}
