import { UserDto } from '../../dto';

export type UserDtoWithExp = UserDto & {
  iat: number;
  exp: number;
};
