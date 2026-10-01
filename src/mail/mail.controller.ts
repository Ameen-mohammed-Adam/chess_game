import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MailService } from './mail.service';

@Controller('mail')
// @UseGuards(AuthGuard())
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get()
  async test() {
    return this.mailService.sendMail();
  }
}
