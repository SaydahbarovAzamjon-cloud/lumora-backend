/**
 * Auth identity providers supported in MVP (ADR-009).
 * Kakao / phone are intentionally excluded.
 */
export enum AuthProviderType {
  EMAIL = 'email',
  GOOGLE = 'google',
}

/**
 * UI locale preference (ADR-016).
 */
export enum UserLocale {
  EN = 'en',
  KO = 'ko',
  UZ = 'uz',
}
