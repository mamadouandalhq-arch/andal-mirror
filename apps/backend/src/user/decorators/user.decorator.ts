import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '../../common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: RequestWithUser = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
