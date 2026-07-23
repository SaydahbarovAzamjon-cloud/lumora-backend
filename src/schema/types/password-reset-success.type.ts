import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description: 'Password reset completed; user must sign in again.',
})
export class PasswordResetSuccessType {
  @Field(() => Boolean)
  success!: boolean;

  @Field(() => String)
  message!: string;
}
