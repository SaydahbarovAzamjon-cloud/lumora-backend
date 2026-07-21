import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description: 'Returned after forgot-password OTP succeeds.',
})
export class PasswordResetOtpVerifiedType {
  @Field(() => String)
  resetToken!: string;

  @Field(() => String)
  message!: string;
}
