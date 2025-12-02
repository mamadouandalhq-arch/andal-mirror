import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { TokenService } from './token/token.service';
import { LoginDto, RegisterDto } from './dto';
import { convertUserToDto } from './utils';
import argon from 'argon2';

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

  async login(loginDto: LoginDto) {
    const existingUser = await this.userService.getOneByEmail(loginDto.email);

    if (!existingUser) {
      throw new BadRequestException('Invalid credentials');
    }

    const isValidPassword = await argon.verify(
      existingUser.password,
      loginDto.password,
    );

    if (!isValidPassword) {
      throw new BadRequestException('Invalid credentials');
    }

    const userDto = convertUserToDto(existingUser);

    return this.tokenService.signTokens(userDto);
  }

  // TODO: refresh

  // TODO: logout
}
