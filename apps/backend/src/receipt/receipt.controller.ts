import {
  Controller,
  Get,
  Param,
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
import { UploadReceiptDocs } from './docs';

@UseGuards(JwtGuard)
@Controller('receipt')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Get('/list')
  getAll(@User() user: UserDto) {
    return this.receiptService.getAll(user.sub);
  }

  @Get('/:id')
  getOne(@Param('id') receiptId: string, @User() user: UserDto) {
    return this.receiptService.getOneOrThrow(receiptId, user.sub);
  }

  @UploadReceiptDocs()
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@User() user: UserDto, @UploadedFile() file: Express.Multer.File) {
    return this.receiptService.saveAndUpload(user.sub, file);
  }
}
