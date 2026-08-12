import { ConfigService } from '@nestjs/config';
import 'multer';
import ImageKit from '@imagekit/nodejs';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class ImageKitConfig {
  constructor(private configService: ConfigService) {}
  async uploadImage(
    image: Express.Multer.File,
    username: string,
  ): Promise<{ url: string; message: string }> {
    const privateKey = String(this.configService.get('IMAGEKIT_PRIVATE_KEY'));
    const clinet = new ImageKit({
      privateKey,
    });
    const imageKitResponse: ImageKit.Files.FileUploadResponse =
      await clinet.files.upload({
        file: image.buffer.toString('base64'),
        fileName: username,
        folder: 'chess-Game/Players-Profile-Images',
      });
    console.log(imageKitResponse);
    if (!imageKitResponse.url) {
      throw new InternalServerErrorException();
    }
    return { url: imageKitResponse.url, message: 'Image Uploaded Successfuly' };
  }
}
