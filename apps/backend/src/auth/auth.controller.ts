import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { Response } from 'express';
import { RequestWithCookies } from './types';
import { TokenService } from './token/token.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.register(registerDto);

    this.tokenService.addRefreshTokenToResponse(res, refreshToken);

    return { accessToken: accessToken };
  }

  @HttpCode(200)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    this.tokenService.addRefreshTokenToResponse(res, refreshToken);

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

    this.tokenService.addRefreshTokenToResponse(res, refreshToken);

    return { accessToken };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    this.tokenService.removeRefreshTokenFromResponse(res);

    return 'Logged out';
  }
}
