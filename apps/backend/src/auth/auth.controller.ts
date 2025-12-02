import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { RequestWithCookies } from './types';

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

  @HttpCode(200)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    this.addRefreshTokenToResponse(res, refreshToken);

    return { accessToken };
  }

  @HttpCode(200)
  @Post('refresh')
  async refresh(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshTokenFromCookie = req.cookies.refreshToken as string | null;

    const { accessToken, refreshToken } = await this.authService.refresh(
      refreshTokenFromCookie,
    );

    this.addRefreshTokenToResponse(res, refreshToken);

    return { accessToken };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    this.removeRefreshTokenFromResponse(res);

    return 'Logged out';
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

  private removeRefreshTokenFromResponse(res: Response) {
    res.clearCookie('refreshToken');
  }
}
