import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserDto } from '../../common';
import { UserDtoWithExp } from '../types';
import { User } from '@prisma/client';
import { convertUserToDto } from '../utils';
import { Response } from 'express';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  removeRefreshTokenFromResponse(res: Response) {
    res.clearCookie('refreshToken');
  }

  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    const expiresInDays = this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION_DAYS',
    )!;
    const expiresIn = new Date();

    expiresIn.setDate(expiresIn.getDate() + parseInt(expiresInDays));

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      expires: expiresIn,
      secure: true,
      sameSite: 'lax',
    });
  }

  signTokensForPrismaUser(user: User) {
    const userDto = convertUserToDto(user);

    return this.signTokens(userDto);
  }

  signTokens(payload: UserDto) {
    const accessToken = this.signAccessToken(payload);
    const refreshToken = this.signRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyToken(token: string): Promise<UserDto> {
    try {
      const userDtoWithExp = await this.jwtService.verifyAsync<UserDtoWithExp>(
        token,
        {
          secret: this.configService.get('JWT_SECRET'),
        },
      );

      return {
        sub: userDtoWithExp.sub,
        email: userDtoWithExp.email,
        role: userDtoWithExp.role,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private signAccessToken(payload: UserDto) {
    const expirationSeconds = this.configService.get<number>(
      'JWT_ACCESS_EXPIRATION_SECONDS',
    )!;

    return this.jwtService.sign(payload, {
      expiresIn: `${expirationSeconds}s`,
    });
  }

  private signRefreshToken(payload: UserDto) {
    const expirationDays = this.configService.get<number>(
      'JWT_REFRESH_EXPIRATION_DAYS',
    )!;

    return this.jwtService.sign(payload, {
      expiresIn: `${expirationDays}d`,
    });
  }
}
