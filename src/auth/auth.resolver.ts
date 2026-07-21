import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  ConfirmEmailInput,
  ForgotPasswordInput,
  GoogleAuthInput,
  LoginInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
  VerifyPasswordResetOtpInput,
} from '../schema/inputs/auth.input';
import { AuthPayloadType } from '../schema/types/auth-payload.type';
import { EmailVerificationPendingType } from '../schema/types/email-verification-pending.type';
import { ForgotPasswordPendingType } from '../schema/types/forgot-password-pending.type';
import { PasswordResetOtpVerifiedType } from '../schema/types/password-reset-otp-verified.type';
import { PasswordResetSuccessType } from '../schema/types/password-reset-success.type';
import { UserType } from '../schema/types/user.type';
import { UsersService } from '../users/users.service';
import { registerVerificationGraphqlEnums } from '../verification/verification-graphql';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './auth.types';
import { CurrentUser } from './current-user.decorator';
import { GqlAuthGuard } from './gql-auth.guard';

registerVerificationGraphqlEnums();

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => EmailVerificationPendingType, {
    description:
      'Register with email/password. Sends OTP via VerificationService; JWT after confirmEmail.',
  })
  register(
    @Args('input') input: RegisterInput,
  ): Promise<EmailVerificationPendingType> {
    return this.authService.register(input);
  }

  @Mutation(() => AuthPayloadType, {
    description: 'Confirm signup OTP and receive JWT.',
  })
  confirmEmail(
    @Args('input') input: ConfirmEmailInput,
  ): Promise<AuthPayloadType> {
    return this.authService.confirmEmail(input);
  }

  @Mutation(() => EmailVerificationPendingType, {
    description: 'Resend signup confirmation OTP.',
  })
  resendVerificationCode(
    @Args('input') input: ResendVerificationInput,
  ): Promise<EmailVerificationPendingType> {
    return this.authService.resendVerification(input);
  }

  @Mutation(() => ForgotPasswordPendingType, {
    description:
      'Start password recovery. OTP channel is chosen from the account auth provider.',
  })
  forgotPassword(
    @Args('input') input: ForgotPasswordInput,
  ): Promise<ForgotPasswordPendingType> {
    return this.authService.forgotPassword(input);
  }

  @Mutation(() => PasswordResetOtpVerifiedType, {
    description:
      'Verify forgot-password OTP and receive a short-lived reset token.',
  })
  verifyPasswordResetOtp(
    @Args('input') input: VerifyPasswordResetOtpInput,
  ): Promise<PasswordResetOtpVerifiedType> {
    return this.authService.verifyPasswordResetOtp(input);
  }

  @Mutation(() => PasswordResetSuccessType, {
    description:
      'Set a new password after OTP verification. Invalidates existing sessions.',
  })
  resetPassword(
    @Args('input') input: ResetPasswordInput,
  ): Promise<PasswordResetSuccessType> {
    return this.authService.resetPassword(input);
  }

  @Mutation(() => AuthPayloadType, {
    description: 'Login with email/password (requires verified email).',
  })
  login(@Args('input') input: LoginInput): Promise<AuthPayloadType> {
    return this.authService.login(input);
  }

  @Mutation(() => AuthPayloadType, {
    description: 'Login or link account via Google ID token.',
  })
  loginWithGoogle(
    @Args('input') input: GoogleAuthInput,
  ): Promise<AuthPayloadType> {
    return this.authService.loginWithGoogle(input);
  }

  @Mutation(() => Boolean, {
    description:
      'Logout. Stateless JWT: client drops token. Refresh revoke deferred (OPEN-014).',
  })
  @UseGuards(GqlAuthGuard)
  logout(): boolean {
    return this.authService.logout();
  }

  @Query(() => UserType, {
    name: 'me',
    description: 'Current authenticated user.',
  })
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() authUser: AuthenticatedUser): Promise<UserType> {
    const user = await this.usersService.findByIdOrFail(authUser.userId);
    return this.usersService.toUserType(user);
  }
}
