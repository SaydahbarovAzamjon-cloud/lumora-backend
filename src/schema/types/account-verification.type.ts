import { Field, Int, ObjectType } from '@nestjs/graphql';
import { VerificationChannel } from '../../verification/verification.constants';
import { VerificationPurpose } from '../../verification/verification.constants';

@ObjectType({
  description: 'OTP dispatched for an authenticated sensitive action.',
})
export class AccountVerificationPendingType {
  @Field(() => Boolean)
  accepted!: boolean;

  @Field(() => VerificationPurpose)
  purpose!: VerificationPurpose;

  @Field(() => VerificationChannel, { nullable: true })
  channel?: VerificationChannel | null;

  @Field(() => String, { nullable: true })
  maskedDestination?: string | null;

  @Field(() => Int, { nullable: true })
  expiresInSeconds?: number | null;

  @Field(() => String)
  message!: string;
}

@ObjectType({
  description: 'OTP confirmed for an authenticated sensitive action.',
})
export class AccountVerificationConfirmedType {
  @Field(() => Boolean)
  verified!: boolean;

  @Field(() => VerificationPurpose)
  purpose!: VerificationPurpose;

  @Field(() => String)
  challengeId!: string;

  @Field(() => String)
  message!: string;
}
