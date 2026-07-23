import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomInt } from 'node:crypto';
import { Model, Types } from 'mongoose';
import { AuthProviderType } from '../common/enums';
import type { UserDocument } from '../users/schemas/user.schema';
import {
  BCRYPT_ROUNDS,
  OTP_MAX_ATTEMPTS,
  OTP_TTL_MS,
  PASSWORD_RESET_TOKEN_TTL_MS,
  VerificationChannel,
  VerificationPurpose,
} from './verification.constants';
import {
  VERIFICATION_CHANNEL_SENDERS,
  VerificationChannelSender,
} from './channels/verification-channel.interface';
import { Inject } from '@nestjs/common';
import {
  VerificationChallenge,
  VerificationChallengeDocument,
} from './schemas/verification-challenge.schema';

export type IssueOtpResult = {
  channel: VerificationChannel;
  maskedDestination: string;
  expiresInSeconds: number;
  authentication: string;
};

export type VerifyOtpResult = {
  challengeId: string;
  resetToken?: string;
};

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);
  private readonly sendersByChannel: Map<
    VerificationChannel,
    VerificationChannelSender
  >;

  constructor(
    @InjectModel(VerificationChallenge.name)
    private readonly challengeModel: Model<VerificationChallengeDocument>,
    @Inject(VERIFICATION_CHANNEL_SENDERS)
    senders: VerificationChannelSender[],
  ) {
    this.sendersByChannel = new Map(senders.map((s) => [s.channel, s]));
  }

  resolveChannel(user: UserDocument): {
    channel: VerificationChannel;
    destination: string;
    authentication: string;
    verificationLabel: string;
  } {
    const providers = user.providers ?? [];
    const hasGoogle = providers.some((p) => p.type === AuthProviderType.GOOGLE);
    const hasEmail = providers.some((p) => p.type === AuthProviderType.EMAIL);

    if (!user.email) {
      throw new BadRequestException(
        'No verifiable destination on this account',
      );
    }

    // MVP: email + Google both deliver OTP to the account email.
    // Future Telegram/phone/Kakao map to other channels here.
    if (hasGoogle && !hasEmail) {
      return {
        channel: VerificationChannel.EMAIL,
        destination: user.email,
        authentication: 'Google OAuth',
        verificationLabel: 'Google Email',
      };
    }

    return {
      channel: VerificationChannel.EMAIL,
      destination: user.email,
      authentication: hasEmail ? 'Email Account' : 'Account Email',
      verificationLabel: 'Email',
    };
  }

  async issueOtp(input: {
    user: UserDocument;
    purpose: VerificationPurpose;
  }): Promise<IssueOtpResult> {
    const resolved = this.resolveChannel(input.user);
    const sender = this.sendersByChannel.get(resolved.channel);
    if (!sender) {
      throw new BadRequestException(
        `Verification channel ${resolved.channel} is not available`,
      );
    }

    await this.invalidateActiveChallenges(input.user.id, input.purpose);

    const code = String(randomInt(100000, 1000000));
    const codeHash = await bcrypt.hash(code, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await this.challengeModel.create({
      userId: new Types.ObjectId(input.user.id),
      purpose: input.purpose,
      channel: resolved.channel,
      destination: resolved.destination,
      codeHash,
      expiresAt,
      attempts: 0,
      maxAttempts: OTP_MAX_ATTEMPTS,
    });

    await sender.sendCode({
      destination: resolved.destination,
      code,
      purposeLabel: this.purposeLabel(input.purpose),
    });

    return {
      channel: resolved.channel,
      maskedDestination: this.maskDestination(
        resolved.channel,
        resolved.destination,
      ),
      expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
      authentication: resolved.authentication,
    };
  }

  async verifyOtp(input: {
    user: UserDocument;
    purpose: VerificationPurpose;
    code: string;
    issueResetToken?: boolean;
  }): Promise<VerifyOtpResult> {
    const challenge = await this.challengeModel
      .findOne({
        userId: new Types.ObjectId(input.user.id),
        purpose: input.purpose,
        consumedAt: { $exists: false },
      })
      .sort({ createdAt: -1 })
      .select('+codeHash +resetTokenHash')
      .exec();

    if (!challenge) {
      throw new BadRequestException('No active verification code');
    }

    if (challenge.otpVerifiedAt) {
      throw new BadRequestException(
        'Verification code already used. Request a new code.',
      );
    }

    if (challenge.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException(
        'Verification code expired. Request a new code.',
      );
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      throw new BadRequestException(
        'Too many verification attempts. Request a new code.',
      );
    }

    const ok = await bcrypt.compare(input.code.trim(), challenge.codeHash);
    challenge.attempts += 1;

    if (!ok) {
      await challenge.save();
      const left = challenge.maxAttempts - challenge.attempts;
      throw new BadRequestException(
        left > 0
          ? `Invalid verification code. ${left} attempt(s) left.`
          : 'Too many verification attempts. Request a new code.',
      );
    }

    // Mark OTP consumed so the same code cannot mint another token.
    challenge.otpVerifiedAt = new Date();
    challenge.codeHash = 'verified';

    if (input.issueResetToken) {
      const resetToken = randomBytes(32).toString('hex');
      challenge.resetTokenHash = this.hashToken(resetToken);
      challenge.resetTokenExpiresAt = new Date(
        Date.now() + PASSWORD_RESET_TOKEN_TTL_MS,
      );
      await challenge.save();
      return { challengeId: challenge.id, resetToken };
    }

    challenge.consumedAt = new Date();
    await challenge.save();
    return { challengeId: challenge.id };
  }

  async consumePasswordResetToken(input: {
    userId: string;
    resetToken: string;
  }): Promise<VerificationChallengeDocument> {
    const tokenHash = this.hashToken(input.resetToken);
    const challenge = await this.challengeModel
      .findOne({
        userId: new Types.ObjectId(input.userId),
        purpose: VerificationPurpose.FORGOT_PASSWORD,
        resetTokenHash: tokenHash,
        consumedAt: { $exists: false },
      })
      .select('+codeHash +resetTokenHash')
      .exec();

    if (!challenge?.resetTokenExpiresAt) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    if (challenge.resetTokenExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Reset token expired. Restart recovery.');
    }

    challenge.consumedAt = new Date();
    challenge.resetTokenHash = undefined;
    challenge.resetTokenExpiresAt = undefined;
    challenge.codeHash = 'consumed';
    await challenge.save();
    return challenge;
  }

  async findChallengeByResetToken(
    resetToken: string,
  ): Promise<VerificationChallengeDocument | null> {
    const tokenHash = this.hashToken(resetToken);
    return this.challengeModel
      .findOne({
        purpose: VerificationPurpose.FORGOT_PASSWORD,
        resetTokenHash: tokenHash,
        consumedAt: { $exists: false },
      })
      .select('+resetTokenHash')
      .exec();
  }

  private async invalidateActiveChallenges(
    userId: string,
    purpose: VerificationPurpose,
  ): Promise<void> {
    await this.challengeModel
      .updateMany(
        {
          userId: new Types.ObjectId(userId),
          purpose,
          consumedAt: { $exists: false },
        },
        {
          $set: {
            consumedAt: new Date(),
            codeHash: 'invalidated',
          },
          $unset: {
            resetTokenHash: 1,
            resetTokenExpiresAt: 1,
          },
        },
      )
      .exec();
  }

  private purposeLabel(purpose: VerificationPurpose): string {
    switch (purpose) {
      case VerificationPurpose.EMAIL_SIGNUP:
        return 'email confirmation';
      case VerificationPurpose.FORGOT_PASSWORD:
        return 'password recovery';
      case VerificationPurpose.PAYMENT:
        return 'payment verification';
      default:
        return 'security verification';
    }
  }

  private maskDestination(
    channel: VerificationChannel,
    destination: string,
  ): string {
    if (channel === VerificationChannel.EMAIL) {
      const [local, domain] = destination.split('@');
      if (!domain) return '***';
      const visible = local.slice(0, 2);
      return `${visible}***@${domain}`;
    }
    return '***';
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /** Helper for callers that need NotFound mapped quietly. */
  assertUser(user: UserDocument | null): asserts user is UserDocument {
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  logDev(message: string): void {
    this.logger.debug(message);
  }
}
