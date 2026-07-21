import {
  OTP_MAX_ATTEMPTS,
  OTP_TTL_MS,
  VerificationPurpose,
} from './verification.constants';
import {
  ACCOUNT_VERIFICATION_PURPOSES,
  isAccountVerificationPurpose,
} from './verification-purpose';

describe('verification constants & purposes', () => {
  it('uses 2-minute OTP TTL and max 5 attempts', () => {
    expect(OTP_TTL_MS).toBe(2 * 60 * 1000);
    expect(OTP_MAX_ATTEMPTS).toBe(5);
  });

  it('keeps signup/forgot-password out of account verification GraphQL surface', () => {
    expect(isAccountVerificationPurpose(VerificationPurpose.EMAIL_SIGNUP)).toBe(
      false,
    );
    expect(
      isAccountVerificationPurpose(VerificationPurpose.FORGOT_PASSWORD),
    ).toBe(false);
  });

  it('includes payment / 2FA / delete / change-* purposes', () => {
    expect(ACCOUNT_VERIFICATION_PURPOSES).toEqual(
      expect.arrayContaining([
        VerificationPurpose.PAYMENT,
        VerificationPurpose.CHANGE_EMAIL,
        VerificationPurpose.CHANGE_PHONE,
        VerificationPurpose.DELETE_ACCOUNT,
        VerificationPurpose.ENABLE_2FA,
        VerificationPurpose.DISABLE_2FA,
        VerificationPurpose.SENSITIVE_ACCOUNT_ACTION,
      ]),
    );
  });
});
