import { UserRole } from '@prisma/client';

export class UserDto {
  sub: string;
  email: string;
  role: UserRole;
}
