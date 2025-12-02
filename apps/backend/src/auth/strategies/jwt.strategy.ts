import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { convertUserToDto } from '../utils';
import { UserDto } from '../../dto';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userService: UserService,
    readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET')!,
      ignoreExpiration: true,
    });
  }

  async validate({ email }: UserDto) {
    const user = await this.userService.getOneByEmail(email);

    if (!user) {
      return null;
    }

    return convertUserToDto(user);
  }
}
