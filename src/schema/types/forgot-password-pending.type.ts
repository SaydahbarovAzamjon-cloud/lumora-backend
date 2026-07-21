import { Field, Int, ObjectType } from '@nestjs/graphql';
import { VerificationChannel } from '../../verification/verification.constants';

@ObjectType({
  description: 'Forgot-password OTP dispatch result (anti-enumeration safe).',
})
export class ForgotPasswordPendingType {
  @Field(() => Boolean)
  accepted!: boolean;

  @Field(() => String)
  message!: string;

  @Field(() => VerificationChannel, { nullable: true })
  channel?: VerificationChannel | null;

  @Field(() => String, { nullable: true })
  maskedDestination?: string | null;

  @Field(() => Int, { nullable: true })
  expiresInSeconds?: number | null;

  @Field(() => String, { nullable: true })
  authentication?: string | null;
}
