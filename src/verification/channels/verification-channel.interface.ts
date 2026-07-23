import { VerificationChannel } from '../verification.constants';

export type SendVerificationCodeInput = {
  destination: string;
  code: string;
  purposeLabel: string;
};

export interface VerificationChannelSender {
  readonly channel: VerificationChannel;
  sendCode(input: SendVerificationCodeInput): Promise<void>;
}

export const VERIFICATION_CHANNEL_SENDERS = Symbol(
  'VERIFICATION_CHANNEL_SENDERS',
);
