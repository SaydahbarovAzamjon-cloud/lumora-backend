import { Field, Int, ObjectType } from '@nestjs/graphql';
import { VerificationChannel } from '../../verification/verification.constants';

@ObjectType({
  description:
    'Returned after register / resend — user must confirm email before JWT is issued.',
})
export class EmailVerificationPendingType {
  @Field(() => String)
  email!: string;

  @Field(() => String)
  message!: string;

  @Field(() => Boolean)
  verificationRequired!: boolean;

  @Field(() => VerificationChannel, { nullable: true })
  channel?: VerificationChannel | null;

  @Field(() => String, { nullable: true })
  maskedDestination?: string | null;

  @Field(() => Int, { nullable: true })
  expiresInSeconds?: number | null;
}
