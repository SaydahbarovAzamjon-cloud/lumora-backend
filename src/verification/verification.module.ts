import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailService } from '../auth/mail.service';
import { AdminNotifyService } from './admin-notify.service';
import { EmailVerificationChannel } from './channels/email-verification.channel';
import { TelegramVerificationChannel } from './channels/telegram-verification.channel';
import { VERIFICATION_CHANNEL_SENDERS } from './channels/verification-channel.interface';
import {
  VerificationChallenge,
  VerificationChallengeSchema,
} from './schemas/verification-challenge.schema';
import { VerificationService } from './verification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: VerificationChallenge.name,
        schema: VerificationChallengeSchema,
      },
    ]),
  ],
  providers: [
    MailService,
    AdminNotifyService,
    EmailVerificationChannel,
    TelegramVerificationChannel,
    {
      provide: VERIFICATION_CHANNEL_SENDERS,
      useFactory: (
        email: EmailVerificationChannel,
        telegram: TelegramVerificationChannel,
      ) => [email, telegram],
      inject: [EmailVerificationChannel, TelegramVerificationChannel],
    },
    VerificationService,
  ],
  exports: [
    VerificationService,
    AdminNotifyService,
    MailService,
    MongooseModule,
  ],
})
export class VerificationModule {}
