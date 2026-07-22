import { Field, InputType } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@InputType()
export class GoogleLoginInput {
  /** Google ID token from the client OAuth flow. */
  @Field(() => String)
  @IsString()
  @MinLength(10)
  idToken!: string;
}