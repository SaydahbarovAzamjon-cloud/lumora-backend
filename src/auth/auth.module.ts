import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { UsersModule } from '../users/users.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is required');
        }
        const expiresIn = (configService.get<string>('JWT_ACCESS_EXPIRES_IN') ??
          '7d') as StringValue;
        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  providers: [AuthService, AuthResolver, JwtStrategy],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
