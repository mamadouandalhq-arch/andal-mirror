import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { TokenService } from './token/token.service';
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  VerifyForgotPasswordTokenDto,
} from './dto';
import argon from 'argon2';
import { ForgotPasswordService } from './forgot-password/forgot-password.service';
import omit from 'lodash/omit';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly forgotPasswordService: ForgotPasswordService,
  ) {}

  async changePassword(dto: ChangePasswordDto) {
    const verifyTokenDto: VerifyForgotPasswordTokenDto = omit(dto, 'password');
    const isValidToken =
      await this.forgotPasswordService.verifyToken(verifyTokenDto);

    if (!isValidToken) {
      return false;
    }

    const tokenInDb = await this.forgotPasswordService.findTokenById(
      verifyTokenDto.tokenId,
    );

    if (!tokenInDb) {
      return false;
    }

    await this.userService.changePasswordOrThrow(
      tokenInDb.userId,
      dto.password,
    );

    await this.forgotPasswordService.deleteTokenByIdOrThrow(tokenInDb.id);

    return true;
  }

  async register(registerDto: RegisterDto) {
    const user = await this.userService.create(registerDto);

    return this.tokenService.signTokensForPrismaUser(user);
  }

  async login(loginDto: LoginDto) {
    const existingUser = await this.userService.getUniqueByEmail(
      loginDto.email,
    );

    if (!existingUser) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!existingUser.password || existingUser.googleId) {
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
