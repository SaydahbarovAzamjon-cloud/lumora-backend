import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsString, Length } from 'class-validator';
import { VerificationPurpose } from '../../verification/verification.constants';

@InputType({
  description:
    'Request OTP for a sensitive account action (payment, 2FA, delete, …).',
})
export class RequestAccountVerificationInput {
  @Field(() => VerificationPurpose)
  @IsEnum(VerificationPurpose)
  purpose!: VerificationPurpose;
}

@InputType({
  description: 'Confirm OTP for a sensitive account action.',
})
export class ConfirmAccountVerificationInput {
  @Field(() => VerificationPurpose)
  @IsEnum(VerificationPurpose)
  purpose!: VerificationPurpose;

  @Field(() => String)
  @IsString()
  @Length(6, 6)
  code!: string;
}
