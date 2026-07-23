export type JwtPayload = {
  sub: string;
  email?: string | null;
  /** Token version — must match user.tokenVersion or JWT is rejected. */
  tv: number;
};

export type AuthenticatedUser = {
  userId: string;
  email?: string | null;
};
