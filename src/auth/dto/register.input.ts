import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class RegisterInput {
  @Field(() => String)
  @IsEmail()
  email!: string;

  @Field(() => String)
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  displayName?: string;
}
