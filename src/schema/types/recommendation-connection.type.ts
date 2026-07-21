import { Field, ObjectType } from '@nestjs/graphql';
import { RecommendationType } from './recommendation.type';

/**
 * Cursor-style history page (API.md §3.4).
 * Exact pagination style is still open; this shape is additive-safe.
 */
@ObjectType({
  description: 'Paginated recommendation history for the current user.',
})
export class RecommendationConnectionType {
  @Field(() => [RecommendationType])
  nodes!: RecommendationType[];

  @Field(() => String, {
    nullable: true,
    description: 'Opaque cursor for the next page, if any.',
  })
  nextCursor?: string | null;
}
