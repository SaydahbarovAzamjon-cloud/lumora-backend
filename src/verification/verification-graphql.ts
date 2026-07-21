import { registerEnumType } from '@nestjs/graphql';
import { VerificationChannel } from './verification.constants';

let registered = false;

export function registerVerificationGraphqlEnums(): void {
  if (registered) return;
  registerEnumType(VerificationChannel, {
    name: 'VerificationChannel',
    description: 'OTP delivery channel resolved from auth provider.',
  });
  registered = true;
}
