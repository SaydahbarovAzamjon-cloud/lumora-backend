import { Field, ID, ObjectType } from '@nestjs/graphql';
import { FaceShape } from '../../common/enums';
import { RecommendationType } from './recommendation.type';

/**
 * Result of analyzeFace mutation (API.md §3.3).
 */
@ObjectType({
  description: 'Face analysis outcome with linked hair recommendation.',
})
export class FaceAnalysisResultType {
  @Field(() => ID)
  id!: string;

  @Field(() => FaceShape)
  faceShape!: FaceShape;

  @Field(() => RecommendationType)
  recommendations!: RecommendationType;
}
