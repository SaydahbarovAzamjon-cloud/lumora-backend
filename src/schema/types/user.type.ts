import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

/**
 * Public user profile (API.md §3.3).
 * passwordHash and provider subjects are intentionally omitted.
 */
@ObjectType({ description: 'Authenticated user profile.' })
export class UserType {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => String, { nullable: true })
  displayName?: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;
}
