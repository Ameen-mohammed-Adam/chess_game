import {
  Controller,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import 'multer';
import { GetUser } from './GetUser.decerator';
import { User } from '../auth/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { GetUserDto } from './dto/getUser.dto';
import { GetUserByIdDto } from './dto/getUserById.dto';
@Controller('user')
@UseGuards(AuthGuard())
export class UserController {
  constructor(private userService: UserService) {}
  @Post('/image')
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ })],
        fileIsRequired: true,
      }),
    )
    image: Express.Multer.File,
    @GetUser() user: User,
  ) {
    return this.userService.uploadImage(user, image);
  }

  @Get('/')
  getMe(@GetUser() user: User): GetUserDto {
    return this.userService.getMe(user);
  }

  @Get('/:id')
  getUserById(@Param('id') userId: string): Promise<GetUserByIdDto> {
    return this.userService.getUserById(userId);
  }
}
