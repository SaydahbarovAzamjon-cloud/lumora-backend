import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  VerificationChannel,
  VerificationPurpose,
} from '../verification.constants';

export type VerificationChallengeDocument =
  HydratedDocument<VerificationChallenge>;

@Schema({
  collection: 'verification_challenges',
  timestamps: true,
})
export class VerificationChallenge {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(VerificationPurpose),
  })
  purpose!: VerificationPurpose;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(VerificationChannel),
  })
  channel!: VerificationChannel;

  /** Destination used for delivery (email / phone / telegram id). */
  @Prop({ type: String, required: true })
  destination!: string;

  @Prop({ type: String, required: true, select: false })
  codeHash!: string;

  @Prop({ type: Date, required: true })
  expiresAt!: Date;

  @Prop({ type: Number, required: true, default: 0 })
  attempts!: number;

  @Prop({ type: Number, required: true, default: 5 })
  maxAttempts!: number;

  @Prop({ type: Date, required: false })
  consumedAt?: Date;

  /** Set when OTP succeeds; code cannot be reused after this. */
  @Prop({ type: Date, required: false })
  otpVerifiedAt?: Date;

  /** Set after OTP succeeds for password-reset continuation. */
  @Prop({ type: String, required: false, select: false })
  resetTokenHash?: string;

  @Prop({ type: Date, required: false })
  resetTokenExpiresAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const VerificationChallengeSchema = SchemaFactory.createForClass(
  VerificationChallenge,
);

VerificationChallengeSchema.index({ userId: 1, purpose: 1, createdAt: -1 });
VerificationChallengeSchema.index({ expiresAt: 1 });
