import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import {
  FaceShape,
  RecommendationCategory,
} from '../enums/analysis.enums';

@ObjectType('RecommendationItem')
export class RecommendationItemModel {
  @Field(() => String, { nullable: true })
  key?: string | null;

  @Field(() => String)
  title!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => Float, { nullable: true })
  score?: number | null;
}

@ObjectType('Recommendation')
export class RecommendationModel {
  @Field(() => ID)
  id!: string;

  @Field(() => RecommendationCategory)
  category!: RecommendationCategory;

  @Field(() => FaceShape)
  faceShape!: FaceShape;

  @Field(() => [RecommendationItemModel])
  items!: RecommendationItemModel[];

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => ID)
  faceAnalysisId!: string;
}

@ObjectType()
export class RecommendationConnection {
  @Field(() => [RecommendationModel])
  items!: RecommendationModel[];

  @Field(() => String, { nullable: true })
  nextCursor?: string | null;
}

@ObjectType()
export class FaceAnalysisResult {
  @Field(() => ID)
  id!: string;

  @Field(() => FaceShape)
  faceShape!: FaceShape;

  @Field(() => RecommendationModel)
  recommendations!: RecommendationModel;
}
