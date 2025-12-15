import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UpdateUserDto } from './dto';
import { UserService } from './user.service';
import { User } from './decorators';
import { UserDto } from '../common';
import { JwtGuard } from '../auth/guards';
import { GetMeDocs, UpdateUserDocs } from './swagger';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
