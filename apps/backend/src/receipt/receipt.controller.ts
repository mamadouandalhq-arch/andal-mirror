import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReceiptService } from './receipt.service';
import { JwtGuard } from '../auth/guards';
import { UserDto } from '../common';
import { User } from '../user/decorators';

@UseGuards(JwtGuard)
@Controller('receipt')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@User() user: UserDto, @UploadedFile() file: Express.Multer.File) {
    return this.receiptService.saveAndUpload(user.sub, file);
  }
}
