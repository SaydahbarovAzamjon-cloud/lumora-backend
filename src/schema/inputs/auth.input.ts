import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Email/password registration input.' })
export class RegisterInput {
  @Field(() => String)
  email!: string;

  @Field(() => String)
  password!: string;

  @Field(() => String, { nullable: true })
  displayName?: string;
}

@InputType({ description: 'Email/password login input.' })
export class LoginInput {
  @Field(() => String)
  email!: string;

  @Field(() => String)
  password!: string;
}

@InputType({
  description: 'Google OAuth login/link input (implementation TBD).',
})
export class GoogleAuthInput {
  @Field(() => String, {
    description: 'ID token or authorization code from Google Sign-In.',
  })
  idToken!: string;
}
