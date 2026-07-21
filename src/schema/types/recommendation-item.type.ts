import { Field, Float, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

/**
 * Single hairstyle recommendation entry (API.md §3.3).
 */
@ObjectType({
  description: 'One recommendation item from the hair catalog match.',
})
export class RecommendationItemType {
  @Field(() => String, { nullable: true })
  key?: string | null;

  @Field(() => String)
  title!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => Float, { nullable: true })
  score?: number | null;

  @Field(() => GraphQLJSON, {
    nullable: true,
    description: 'Optional extra attributes from the catalog/AI.',
  })
  metadata?: Record<string, unknown> | null;
}
