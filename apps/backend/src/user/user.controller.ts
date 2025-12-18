import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateUserDto } from './dto';
import { UserService } from './user.service';
import { User } from './decorators';
import { createMimeTypeFilter, UserDto } from '../common';
import { JwtGuard } from '../auth/guards';
import { GetMeDocs, UpdateUserDocs } from './swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { supportedMimeTypes } from './consts';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/upload-avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: createMimeTypeFilter(supportedMimeTypes),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadAvatar(
    @User() user: UserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.userService.uploadAvatar(user.sub, file);
  }

  @UpdateUserDocs()
  @Post('/update')
  async update(@User() user: UserDto, @Body() dto: UpdateUserDto) {
    return await this.userService.update(user.sub, dto);
  }

  @GetMeDocs()
  @Get('/me')
  async me(@User() user: UserDto) {
    return await this.userService.getMe(user.sub);
  }
}
