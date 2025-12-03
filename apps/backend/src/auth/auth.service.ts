import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { TokenService } from './token/token.service';
import { LoginDto, RegisterDto } from './dto';
import argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.userService.create(registerDto);

    return this.tokenService.signTokensForPrismaUser(user);
  }

  async login(loginDto: LoginDto) {
    const existingUser = await this.userService.getOneByEmail(loginDto.email);

    if (!existingUser) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!existingUser.password || existingUser.google_id) {
      throw new BadRequestException('User was created using Google!');
    }

    const isValidPassword = await argon.verify(
      existingUser.password,
      loginDto.password,
    );

    if (!isValidPassword) {
      throw new BadRequestException('Invalid credentials');
    }

    return this.tokenService.signTokensForPrismaUser(existingUser);
  }

  async refresh(refreshToken: string | null) {
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userDto = await this.tokenService.verifyToken(refreshToken);

    return this.tokenService.signTokens(userDto);
  }
}
