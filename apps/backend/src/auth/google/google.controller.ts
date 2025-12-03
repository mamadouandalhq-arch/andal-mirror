import {
  Controller,
  Get,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { GoogleGuard } from './guards';
import { GoogleService } from './google.service';
import { RequestWithUser } from '../../common';
import { GoogleProfileDto } from './dto';
import { Response } from 'express';
import { TokenService } from '../token/token.service';

@UseGuards(GoogleGuard)
@Controller('auth/google')
export class GoogleController {
  constructor(
    private readonly googleService: GoogleService,
    private readonly tokenService: TokenService,
  ) {}

  @Get()
  googleAuth() {
    return;
  }

  @Get('redirect')
  async googleAuthRedirect(
    @Req() req: RequestWithUser<GoogleProfileDto>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { accessToken, refreshToken } =
      await this.googleService.getTokensForGoogleUser(user);

    this.tokenService.addRefreshTokenToResponse(res, refreshToken);

    return { accessToken };
  }
}
