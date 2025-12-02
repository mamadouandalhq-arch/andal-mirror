import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { TokenService } from './token/token.service';
import { RegisterDto } from './dto';
import { convertUserToDto } from './utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.userService.create(registerDto);

    const userDto = convertUserToDto(user);

    return this.tokenService.signTokens(userDto);
  }

  // TODO: register

  // TODO: refresh

  // TODO: logout
}
