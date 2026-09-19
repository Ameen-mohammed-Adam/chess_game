import { ConfigService } from '@nestjs/config';
import 'multer';
import ImageKit from '@imagekit/nodejs';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ImageKitResponseDto } from '../dto/imageKit-response.dto';

@Injectable()
export class ImageKitConfig {
  private readonly client: ImageKit;
  private logger = new Logger();
  constructor(private configService: ConfigService) {
    const privateKey = String(this.configService.get('IMAGEKIT_PRIVATE_KEY'));
    this.client = new ImageKit({
      privateKey,
    });
  }
  async uploadImage(
    image: Express.Multer.File,
    username: string,
  ): Promise<ImageKitResponseDto> {
    const imageKitResponse: ImageKit.Files.FileUploadResponse =
      await this.client.files.upload({
        file: image.buffer.toString('base64'),
        fileName: username,
        folder: 'chess-Game/Players-Profile-Images',
      });
    if (!imageKitResponse.fileId || !imageKitResponse.url) {
      this.logger.error(imageKitResponse);
      throw new InternalServerErrorException();
    }
    return {
      imageId: imageKitResponse.fileId,
      imageUrl: imageKitResponse.url,
      message: 'Image Uploaded Successfuly',
    };
  }
  async deleteImage(imageId: string): Promise<void> {
    const deletedImage = await this.client.files.delete(imageId);
    console.log(deletedImage);
    this.logger.log(`image with id ${imageId} was deleted.`);
  }
}
