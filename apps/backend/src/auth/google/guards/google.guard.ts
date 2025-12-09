import { AuthGuard } from '@nestjs/passport';
import { BadRequestException, ExecutionContext, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SessionWithState } from '../../types';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

export class GoogleGuard extends AuthGuard('google') {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const state = request.query.state as string | undefined;

    const session = request.session as SessionWithState;

    const frontendUrl = this.configService.get<string | undefined>(
      'FRONTEND_URL',
    )!;

    if (!state || !state.startsWith(frontendUrl)) {
      throw new BadRequestException('Invalid state');
    }
    session.state = state;

    return super.canActivate(context);
  }
}
