import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodeMailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';
@Injectable()
export class MailService {
  private logger = new Logger();
  private transporter: nodeMailer.Transporter;
  constructor(private configService: ConfigService) {
    this.transporter = nodeMailer.createTransport({
      host: this.configService.get('SMTP_HOST') ?? 'localhost',
      port: this.configService.get('SMTP_PORT') ?? 1025,
      secure: false,
      auth:
        this.configService.get('SMPT_User') &&
        this.configService.get('SMTP_Pass')
          ? {
              user: this.configService.get('SMTP_USER'),
              pass: this.configService.get('SMTP_PASS'),
            }
          : undefined,
    });
  }
  async verify() {
    return this.transporter.verify();
  }
  async sendMail() {
    await this.verify();
    const info: nodeMailer.SentMessageInfo = await this.transporter.sendMail({
      from: 'testmail@mail.com',
      to: 'this@gmail.com',
      subject: 'hello World',
      html: readFileSync(join(__dirname, './utils/e-mail_html.html'), 'utf8'),
    });
    this.logger.verbose(info);
  }

  async reciveVerification() {}
}
