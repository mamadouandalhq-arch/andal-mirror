import { Injectable } from '@nestjs/common';
import { GoogleProfileDto } from './dto';
import { UserService } from '../../user/user.service';
import { TokenService } from '../token/token.service';
import { EmailService } from '../../email/email.service';
import { User } from '@prisma/client';

@Injectable()
export class GoogleService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
  ) {}

  async getTokensForGoogleUser(dto: GoogleProfileDto) {
    const result = await this.userService.getOrCreateGoogleUser(dto);
    const user: User = result.user;
    const wasCreated: boolean = result.wasCreated;

    if (wasCreated) {
      await this.emailService.sendWelcomeEmail({
        email: dto.email,
        firstName: dto.firstName,
      });
    }

    return this.tokenService.signTokensForPrismaUser(user);
  }
}
