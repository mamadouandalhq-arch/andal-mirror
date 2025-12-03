import { Request } from 'express';
import { UserDto } from '../dto';
import { GoogleProfileDto } from '../../auth/google/dto';

export type RequestWithUser<T = UserDto | GoogleProfileDto> = Request & {
  user?: T | null;
};
