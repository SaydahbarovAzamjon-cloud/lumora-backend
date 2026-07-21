/**
 * Password policy for reset / future change-password:
 * min 8, upper, lower, number, special character.
 */
export function assertStrongPassword(password: string): void {
  const rules: Array<{ ok: boolean; message: string }> = [
    {
      ok: password.length >= 8,
      message: 'Password must be at least 8 characters',
    },
    {
      ok: /[A-Z]/.test(password),
      message: 'Password must include an uppercase letter',
    },
    {
      ok: /[a-z]/.test(password),
      message: 'Password must include a lowercase letter',
    },
    {
      ok: /[0-9]/.test(password),
      message: 'Password must include a number',
    },
    {
      ok: /[^A-Za-z0-9]/.test(password),
      message: 'Password must include a special character',
    },
  ];

  const failed = rules.find((r) => !r.ok);
  if (failed) {
    throw new Error(failed.message);
  }
}

export function isStrongPassword(password: string): boolean {
  try {
    assertStrongPassword(password);
    return true;
  } catch {
    return false;
  }
}
