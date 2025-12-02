import { User } from '@prisma/client';
import { UserDto } from '../../dto';

export const convertUserToDto = (user: User): UserDto => {
  return {
    sub: user.id,
    email: user.email,
  };
};
