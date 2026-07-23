import { Injectable } from '@nestjs/common';
import { MailService } from '../../auth/mail.service';
import { VerificationChannel } from '../verification.constants';
import {
  SendVerificationCodeInput,
  VerificationChannelSender,
} from './verification-channel.interface';

@Injectable()
export class EmailVerificationChannel implements VerificationChannelSender {
  readonly channel = VerificationChannel.EMAIL;

  constructor(private readonly mailService: MailService) {}

  sendCode(input: SendVerificationCodeInput): Promise<void> {
    return this.mailService.sendVerificationCode({
      email: input.destination,
      code: input.code,
      purposeLabel: input.purposeLabel,
    });
  }
}
