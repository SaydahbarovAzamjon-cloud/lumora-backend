import { assertStrongPassword, isStrongPassword } from './password-policy';

describe('password-policy', () => {
  it('accepts a strong password', () => {
    expect(isStrongPassword('Abcdef1!')).toBe(true);
  });

  it('rejects short passwords', () => {
    expect(() => assertStrongPassword('Ab1!x')).toThrow(/at least 8/);
  });

  it('requires uppercase', () => {
    expect(() => assertStrongPassword('abcdef1!')).toThrow(/uppercase/);
  });

  it('requires lowercase', () => {
    expect(() => assertStrongPassword('ABCDEF1!')).toThrow(/lowercase/);
  });

  it('requires a number', () => {
    expect(() => assertStrongPassword('Abcdefg!')).toThrow(/number/);
  });

  it('requires a special character', () => {
    expect(() => assertStrongPassword('Abcdef12')).toThrow(/special/);
  });
});
