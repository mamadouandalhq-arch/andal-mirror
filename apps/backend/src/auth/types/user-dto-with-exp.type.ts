import { UserDto } from '../../common/dto';

export type UserDtoWithExp = UserDto & {
  iat: number;
  exp: number;
};
