import { registerEnumType } from '@nestjs/graphql';
import { VerificationPurpose } from './verification.constants';

/** Purposes that authenticated users can request via GraphQL (not public signup/forgot). */
export const ACCOUNT_VERIFICATION_PURPOSES: VerificationPurpose[] = [
  VerificationPurpose.PAYMENT,
  VerificationPurpose.CHANGE_EMAIL,
  VerificationPurpose.CHANGE_PHONE,
  VerificationPurpose.DELETE_ACCOUNT,
  VerificationPurpose.ENABLE_2FA,
  VerificationPurpose.DISABLE_2FA,
  VerificationPurpose.SENSITIVE_ACCOUNT_ACTION,
];

export function isAccountVerificationPurpose(
  purpose: VerificationPurpose,
): boolean {
  return ACCOUNT_VERIFICATION_PURPOSES.includes(purpose);
}

let purposeRegistered = false;

export function registerVerificationPurposeEnum(): void {
  if (purposeRegistered) return;
  registerEnumType(VerificationPurpose, {
    name: 'VerificationPurpose',
    description:
      'Shared OTP purpose. Signup/forgot-password use dedicated mutations; others use requestAccountVerification.',
  });
  purposeRegistered = true;
}
