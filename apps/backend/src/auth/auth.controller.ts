import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  private readonly EXPIRE_DAY_REFRESH_TOKEN: string;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.EXPIRE_DAY_REFRESH_TOKEN = configService.get<string>(
      'JWT_REFRESH_EXPIRATION_DAYS',
    )!;
  }

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.register(registerDto);

    this.addRefreshTokenToResponse(res, tokens.refreshToken);

    return { accessToken: tokens.accessToken };
  }

  private addRefreshTokenToResponse(res: Response, refreshToken: string) {
    const expiresIn = new Date();

    expiresIn.setDate(
      expiresIn.getDate() + parseInt(this.EXPIRE_DAY_REFRESH_TOKEN),
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      expires: expiresIn,
      secure: true,
      sameSite: 'lax',
    });
  }
}
