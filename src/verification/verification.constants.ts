export enum VerificationPurpose {
  EMAIL_SIGNUP = 'EMAIL_SIGNUP',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  PAYMENT = 'PAYMENT',
  CHANGE_EMAIL = 'CHANGE_EMAIL',
  CHANGE_PHONE = 'CHANGE_PHONE',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  ENABLE_2FA = 'ENABLE_2FA',
  DISABLE_2FA = 'DISABLE_2FA',
  SENSITIVE_ACCOUNT_ACTION = 'SENSITIVE_ACCOUNT_ACTION',
}

/**
 * Delivery channel selected from the user's authentication provider.
 * MVP implements EMAIL. Others are reserved for future providers.
 */
export enum VerificationChannel {
  EMAIL = 'EMAIL',
  TELEGRAM = 'TELEGRAM',
  SMS = 'SMS',
  KAKAO = 'KAKAO',
}

export const OTP_TTL_MS = 2 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const PASSWORD_RESET_TOKEN_TTL_MS = 5 * 60 * 1000;
export const BCRYPT_ROUNDS = 12;
