import {
  Controller,
  FileTypeValidator,
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
@Controller('user')
@UseGuards(AuthGuard())
export class UserController {
  constructor(private userService: UserService) {}
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  get(
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
}
