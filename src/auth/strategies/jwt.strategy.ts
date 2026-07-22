import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../auth.service';
import { toUserModel } from '../mappers/to-user-model';
import { UserModel } from '../models/user.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserModel> {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid access token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return toUserModel(user);
  }
}
