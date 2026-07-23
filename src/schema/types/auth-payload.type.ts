import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from './user.type';

/**
 * Auth mutation payload (API.md §3.3).
 * refreshToken remains optional until OPEN-014 is closed.
 */
@ObjectType({ description: 'Tokens and user returned after register/login.' })
export class AuthPayloadType {
  @Field(() => String)
  accessToken!: string;

  @Field(() => String, {
    nullable: true,
    description:
      'Present only if refresh-token strategy is enabled (OPEN-014).',
  })
  refreshToken?: string | null;

  @Field(() => UserType)
  user!: UserType;
}
