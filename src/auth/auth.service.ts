import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { GoogleLoginInput } from './dto/google-login.input';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { toUserModel } from './mappers/to-user-model';
import { AuthPayload } from './models/auth-payload.model';
import { UserModel } from './models/user.model';

export type JwtPayload = {
  sub: string;
  email: string;
};

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async register(input: RegisterInput): Promise<AuthPayload> {
    const email = input.email.toLowerCase().trim();
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await this.usersService.createEmailUser({
      email,
      passwordHash,
      displayName: input.displayName?.trim() || undefined,
    });

    return this.buildAuthPayload(user);
  }

  async login(input: LoginInput): Promise<AuthPayload> {
    const email = input.email.toLowerCase().trim();
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthPayload(user);
  }

  async loginWithGoogle(input: GoogleLoginInput): Promise<AuthPayload> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new UnauthorizedException('Google sign-in is not configured');
    }

    let payload: {
      sub?: string;
      email?: string;
      email_verified?: boolean | string;
      name?: string;
    };
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: input.idToken,
        audience: clientId,
      });
      payload = ticket.getPayload() ?? {};
    } catch {
      throw new UnauthorizedException('Invalid Google ID token');
    }

    const googleSubject = payload.sub;
    const email = payload.email?.toLowerCase();
    const emailVerified =
      payload.email_verified === true || payload.email_verified === 'true';

    if (!googleSubject || !email || !emailVerified) {
      throw new UnauthorizedException(
        'Google account must have a verified email',
      );
    }

    const user = await this.usersService.upsertGoogleUser({
      email,
      googleSubject,
      displayName: payload.name,
    });

    return this.buildAuthPayload(user);
  }

  async me(userId: string): Promise<UserModel> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return toUserModel(user);
  }

  /** Client should discard the access token. Server-side revoke awaits OPEN-014. */
  logout(): boolean {
    return true;
  }

  private buildAuthPayload(user: UserDocument): AuthPayload {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: null,
      user: toUserModel(user),
    };
  }
}
