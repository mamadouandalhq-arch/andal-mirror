import { Injectable } from '@nestjs/common';
import { GoogleProfileDto } from './dto';
import { UserService } from '../../user/user.service';
import { TokenService } from '../token/token.service';

@Injectable()
export class GoogleService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async getTokensForGoogleUser(dto: GoogleProfileDto) {
    const user = await this.userService.getOrCreateGoogleUser(dto);

    return this.tokenService.signTokensForPrismaUser(user);
  }
}
