import { Request } from 'express';
import { UserDto } from '../dto';

export type RequestWithUser = Request & {
  user?: UserDto | null;
};
