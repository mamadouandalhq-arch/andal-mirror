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
import { GoogleAuthDocs, GoogleAuthRedirectDocs } from './docs';

@UseGuards(GoogleGuard)
@Controller('auth/google')
export class GoogleController {
  constructor(
    private readonly googleService: GoogleService,
    private readonly tokenService: TokenService,
  ) {}

  @GoogleAuthDocs()
  @Get()
  googleAuth() {
    return;
  }

  @GoogleAuthRedirectDocs()
  @Get('redirect')
  async googleAuthRedirect(
    @Req() req: RequestWithUser<GoogleProfileDto>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('Missing Google OAuth user payload');
    }

    const { accessToken, refreshToken } =
      await this.googleService.getTokensForGoogleUser(user);

    this.tokenService.addRefreshTokenToResponse(res, refreshToken);

    return { accessToken };
  }
}
