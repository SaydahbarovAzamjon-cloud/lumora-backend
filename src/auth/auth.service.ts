import {
  BadRequestException,
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { assertStrongPassword } from '../common/password/password-policy';
import {
  ConfirmEmailInput,
  ForgotPasswordInput,
  GoogleAuthInput,
  LoginInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
  VerifyPasswordResetOtpInput,
} from '../schema/inputs/auth.input';
import { AuthPayloadType } from '../schema/types/auth-payload.type';
import { EmailVerificationPendingType } from '../schema/types/email-verification-pending.type';
import { ForgotPasswordPendingType } from '../schema/types/forgot-password-pending.type';
import { PasswordResetOtpVerifiedType } from '../schema/types/password-reset-otp-verified.type';
import { PasswordResetSuccessType } from '../schema/types/password-reset-success.type';
import { UsersService } from '../users/users.service';
import type { UserDocument } from '../users/schemas/user.schema';
import { AdminNotifyService } from '../verification/admin-notify.service';
import {
  BCRYPT_ROUNDS,
  VerificationPurpose,
} from '../verification/verification.constants';
import { VerificationService } from '../verification/verification.service';
import { JwtPayload } from './auth.types';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client | null;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly verificationService: VerificationService,
    private readonly adminNotify: AdminNotifyService,
  ) {
    const googleClientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    this.googleClient = googleClientId
      ? new OAuth2Client(googleClientId)
      : null;
  }

  async register(input: RegisterInput): Promise<EmailVerificationPendingType> {
    try {
      assertStrongPassword(input.password);
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Invalid password',
      );
    }

    const email = input.email.toLowerCase().trim();
    const existing = await this.usersService.findByEmail(email);

    if (existing?.emailVerified) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    let user: UserDocument;
    if (existing && !existing.emailVerified) {
      existing.passwordHash = passwordHash;
      if (input.displayName?.trim()) {
        existing.displayName = input.displayName.trim();
      }
      user = await existing.save();
    } else {
      user = await this.usersService.createEmailUser({
        email,
        passwordHash,
        displayName: input.displayName,
      });
    }

    const issued = await this.verificationService.issueOtp({
      user,
      purpose: VerificationPurpose.EMAIL_SIGNUP,
    });

    return {
      email,
      verificationRequired: true,
      message: `Confirmation code sent to ${issued.maskedDestination}. Enter the code to finish signup.`,
      channel: issued.channel,
      maskedDestination: issued.maskedDestination,
      expiresInSeconds: issued.expiresInSeconds,
    };
  }

  async confirmEmail(input: ConfirmEmailInput): Promise<AuthPayloadType> {
    const email = input.email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid confirmation code');
    }
    if (user.emailVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.verificationService.verifyOtp({
      user,
      purpose: VerificationPurpose.EMAIL_SIGNUP,
      code: input.code,
    });

    user.emailVerified = true;
    await user.save();

    return this.buildAuthPayload(user.id, user.email);
  }

  async resendVerification(
    input: ResendVerificationInput,
  ): Promise<EmailVerificationPendingType> {
    const email = input.email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(email);
    if (!user || user.emailVerified) {
      return {
        email,
        verificationRequired: true,
        message:
          'If an unverified account exists for this email, a new code was sent.',
        channel: null,
        maskedDestination: null,
        expiresInSeconds: null,
      };
    }

    const issued = await this.verificationService.issueOtp({
      user,
      purpose: VerificationPurpose.EMAIL_SIGNUP,
    });

    return {
      email,
      verificationRequired: true,
      message: `Confirmation code sent to ${issued.maskedDestination}.`,
      channel: issued.channel,
      maskedDestination: issued.maskedDestination,
      expiresInSeconds: issued.expiresInSeconds,
    };
  }

  async forgotPassword(
    input: ForgotPasswordInput,
  ): Promise<ForgotPasswordPendingType> {
    const identifier = input.identifier.toLowerCase().trim();
    // MVP identifier = email (no separate username field yet).
    const user = await this.usersService.findByEmail(identifier);

    // Anti-enumeration: identical response whether or not the account exists.
    const generic: ForgotPasswordPendingType = {
      accepted: true,
      message:
        'If an account exists for that identifier, a verification code was sent.',
      channel: null,
      maskedDestination: null,
      expiresInSeconds: null,
      authentication: null,
    };

    if (!user?.email) {
      return generic;
    }

    await this.verificationService.issueOtp({
      user,
      purpose: VerificationPurpose.FORGOT_PASSWORD,
    });

    return generic;
  }

  async verifyPasswordResetOtp(
    input: VerifyPasswordResetOtpInput,
  ): Promise<PasswordResetOtpVerifiedType> {
    const email = input.email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid verification code');
    }

    const verified = await this.verificationService.verifyOtp({
      user,
      purpose: VerificationPurpose.FORGOT_PASSWORD,
      code: input.code,
      issueResetToken: true,
    });

    if (!verified.resetToken) {
      throw new BadRequestException('Unable to issue reset token');
    }

    return {
      resetToken: verified.resetToken,
      message: 'Code verified. Set a new password.',
    };
  }

  async resetPassword(
    input: ResetPasswordInput,
  ): Promise<PasswordResetSuccessType> {
    try {
      assertStrongPassword(input.newPassword);
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Invalid password',
      );
    }

    const challenge = await this.verificationService.findChallengeByResetToken(
      input.resetToken,
    );
    if (!challenge) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const userId = String(challenge.userId);
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const resolved = this.verificationService.resolveChannel(user);

    await this.verificationService.consumePasswordResetToken({
      userId,
      resetToken: input.resetToken,
    });

    const passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);
    const updated = await this.usersService.updatePasswordAndInvalidateSessions(
      {
        userId,
        passwordHash,
      },
    );

    await this.adminNotify.notifyPasswordReset({
      displayName: updated.displayName,
      userId: updated.id,
      authentication: resolved.authentication,
      identifier: updated.email ?? '—',
      verification: resolved.verificationLabel,
      status: 'SUCCESS',
      timeIso: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'Password updated. Please sign in again.',
    };
  }

  async login(input: LoginInput): Promise<AuthPayloadType> {
    const email = input.email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(email);
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Email not verified. Enter the confirmation code sent to your email.',
      );
    }

    return this.buildAuthPayload(user.id, user.email);
  }

  async loginWithGoogle(input: GoogleAuthInput): Promise<AuthPayloadType> {
    if (!this.googleClient) {
      throw new ServiceUnavailableException(
        'Google OAuth is not configured (GOOGLE_CLIENT_ID missing)',
      );
    }

    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    let tokenPayload: TokenPayload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: input.idToken,
        audience: clientId,
      });
      const verified = ticket.getPayload();
      if (!verified?.sub) {
        throw new BadRequestException('Google token missing subject');
      }
      tokenPayload = verified;
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid Google ID token');
    }

    const user = await this.usersService.upsertGoogleUser({
      googleSub: tokenPayload.sub,
      email: tokenPayload.email,
      displayName: tokenPayload.name,
    });

    return this.buildAuthPayload(user.id, user.email);
  }

  logout(): boolean {
    return true;
  }

  private async buildAuthPayload(
    userId: string,
    email?: string | null,
  ): Promise<AuthPayloadType> {
    const user = await this.usersService.findByIdOrFail(userId);
    const payload: JwtPayload = {
      sub: userId,
      email: email ?? user.email ?? null,
      tv: user.tokenVersion ?? 0,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      refreshToken: null,
      user: this.usersService.toUserType(user),
    };
  }
}
