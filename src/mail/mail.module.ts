import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [AuthModule, ConfigModule],
  providers: [MailService, ConfigService],
  controllers: [MailController],
})
export class MailModule {}
