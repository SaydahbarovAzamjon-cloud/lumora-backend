import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Email/password registration input.' })
export class RegisterInput {
  @Field(() => String)
  @IsEmail()
  email!: string;

  @Field(() => String)
  @IsString()
  @MinLength(8)
  password!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  displayName?: string;
}

@InputType({ description: 'Email/password login input.' })
export class LoginInput {
  @Field(() => String)
  @IsEmail()
  email!: string;

  @Field(() => String)
  @IsString()
  @MinLength(1)
  password!: string;
}

@InputType({
  description: 'Google Sign-In via ID token (verified server-side).',
})
export class GoogleAuthInput {
  @Field(() => String, {
    description: 'Google ID token from Google Sign-In on the client.',
  })
  @IsString()
  @MinLength(10)
  idToken!: string;
}

@InputType({ description: 'Confirm signup with the email verification code.' })
export class ConfirmEmailInput {
  @Field(() => String)
  @IsEmail()
  email!: string;

  @Field(() => String, { description: '6-digit confirmation code from email.' })
  @IsString()
  @Length(6, 6)
  code!: string;
}

@InputType({ description: 'Resend email verification code.' })
export class ResendVerificationInput {
  @Field(() => String)
  @IsEmail()
  email!: string;
}

@InputType({ description: 'Start forgot-password recovery.' })
export class ForgotPasswordInput {
  @Field(() => String, {
    description: 'Email (or future username). MVP uses email.',
  })
  @IsString()
  @MinLength(3)
  identifier!: string;
}

@InputType({ description: 'Verify forgot-password OTP.' })
export class VerifyPasswordResetOtpInput {
  @Field(() => String)
  @IsEmail()
  email!: string;

  @Field(() => String)
  @IsString()
  @Length(6, 6)
  code!: string;
}

@InputType({ description: 'Set a new password after OTP verification.' })
export class ResetPasswordInput {
  @Field(() => String)
  @IsString()
  @MinLength(20)
  resetToken!: string;

  @Field(() => String)
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
