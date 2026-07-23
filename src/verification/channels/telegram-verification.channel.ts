import { Injectable, Logger } from '@nestjs/common';
import { VerificationChannel } from '../verification.constants';
import {
  SendVerificationCodeInput,
  VerificationChannelSender,
} from './verification-channel.interface';

/**
 * Reserved for Telegram-login accounts (not MVP auth). Structured for reuse.
 */
@Injectable()
export class TelegramVerificationChannel implements VerificationChannelSender {
  readonly channel = VerificationChannel.TELEGRAM;
  private readonly logger = new Logger(TelegramVerificationChannel.name);

  sendCode(input: SendVerificationCodeInput): Promise<void> {
    this.logger.warn(
      `Telegram OTP channel not configured for ${input.destination} (${input.purposeLabel})`,
    );
    return Promise.reject(
      new Error('Telegram verification channel is not configured'),
    );
  }
}
