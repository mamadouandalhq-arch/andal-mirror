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
import { createMimeTypeFilter, UserDto } from '../common';
import { User } from '../user/decorators';
import {
  GetReceiptDocs,
  GetReceiptListDocs,
  UploadReceiptDocs,
} from './swagger';
import { supportedMimeTypes } from './consts';

@UseGuards(JwtGuard)
@Controller('receipt')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @GetReceiptListDocs()
  @Get('/list')
  async getAll(@User() user: UserDto) {
    return await this.receiptService.getAll(user.sub);
  }

  @GetReceiptDocs()
  @Get('/:id')
  async getOne(@Param('id') receiptId: string, @User() user: UserDto) {
    return await this.receiptService.getOneOrThrow(receiptId, user.sub);
  }

  @UploadReceiptDocs()
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: createMimeTypeFilter(supportedMimeTypes),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadFile(
    @User() user: UserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.receiptService.saveAndUpload(user.sub, file);
  }
}
