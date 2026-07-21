import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import { FaceShape } from '../../common/enums';
import { RecommendationCategory } from '../../common/enums';
import { RecommendationItemType } from './recommendation-item.type';

/**
 * Persisted recommendation / history row (API.md §3.3).
 */
@ObjectType({
  description: 'Hair recommendation result owned by the current user.',
})
export class RecommendationType {
  @Field(() => ID)
  id!: string;

  @Field(() => RecommendationCategory)
  category!: RecommendationCategory;

  @Field(() => FaceShape)
  faceShape!: FaceShape;

  @Field(() => [RecommendationItemType])
  items!: RecommendationItemType[];

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => ID)
  faceAnalysisId!: string;
}
