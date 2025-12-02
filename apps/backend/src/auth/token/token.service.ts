import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserDto } from '../../dto';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  signTokens(payload: UserDto) {
    const accessToken = this.signAccessToken(payload);
    const refreshToken = this.signRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyToken(token: string) {
    try {
      return await this.jwtService.verifyAsync<UserDto>(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
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
