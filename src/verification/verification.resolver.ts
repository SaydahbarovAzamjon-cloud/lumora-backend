import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  ConfirmAccountVerificationInput,
  RequestAccountVerificationInput,
} from '../schema/inputs/account-verification.input';
import {
  AccountVerificationConfirmedType,
  AccountVerificationPendingType,
} from '../schema/types/account-verification.type';
import { UsersService } from '../users/users.service';
import { registerVerificationGraphqlEnums } from './verification-graphql';
import {
  isAccountVerificationPurpose,
  registerVerificationPurposeEnum,
} from './verification-purpose';
import { VerificationService } from './verification.service';

registerVerificationGraphqlEnums();
registerVerificationPurposeEnum();

@Resolver()
export class VerificationResolver {
  constructor(
    private readonly verificationService: VerificationService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => AccountVerificationPendingType, {
    description:
      'Request OTP for payment / 2FA / change-email / delete-account / sensitive actions. Domain side-effects (charge, delete, …) come in later tasks; this only runs shared verification.',
  })
  @UseGuards(GqlAuthGuard)
  async requestAccountVerification(
    @CurrentUser() authUser: AuthenticatedUser,
    @Args('input') input: RequestAccountVerificationInput,
  ): Promise<AccountVerificationPendingType> {
    if (!isAccountVerificationPurpose(input.purpose)) {
      throw new BadRequestException(
        'Use dedicated auth mutations for signup / forgot-password',
      );
    }

    const user = await this.usersService.findByIdOrFail(authUser.userId);
    const issued = await this.verificationService.issueOtp({
      user,
      purpose: input.purpose,
    });

    return {
      accepted: true,
      purpose: input.purpose,
      channel: issued.channel,
      maskedDestination: issued.maskedDestination,
      expiresInSeconds: issued.expiresInSeconds,
      message: `Verification code sent to ${issued.maskedDestination}.`,
    };
  }

  @Mutation(() => AccountVerificationConfirmedType, {
    description:
      'Confirm OTP for a sensitive account action. Callers must still perform the domain action after this returns verified=true.',
  })
  @UseGuards(GqlAuthGuard)
  async confirmAccountVerification(
    @CurrentUser() authUser: AuthenticatedUser,
    @Args('input') input: ConfirmAccountVerificationInput,
  ): Promise<AccountVerificationConfirmedType> {
    if (!isAccountVerificationPurpose(input.purpose)) {
      throw new BadRequestException(
        'Use dedicated auth mutations for signup / forgot-password',
      );
    }

    const user = await this.usersService.findByIdOrFail(authUser.userId);
    const verified = await this.verificationService.verifyOtp({
      user,
      purpose: input.purpose,
      code: input.code,
    });

    return {
      verified: true,
      purpose: input.purpose,
      challengeId: verified.challengeId,
      message: 'Verification confirmed.',
    };
  }
}
