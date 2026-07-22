import { Field, ObjectType } from '@nestjs/graphql';
import { UserModel } from './user.model';

@ObjectType()
export class AuthPayload {
  @Field(() => String)
  accessToken!: string;

  /** Omitted until OPEN-014 (refresh strategy) is decided. */
  @Field(() => String, { nullable: true })
  refreshToken?: string | null;

  @Field(() => UserModel)
  user!: UserModel;
}
