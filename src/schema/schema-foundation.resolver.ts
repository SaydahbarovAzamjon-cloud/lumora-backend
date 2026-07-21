import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { AnalyzeFaceInput } from './inputs/analyze-face.input';
import { FaceAnalysisResultType } from './types/face-analysis-result.type';
import { RecommendationConnectionType } from './types/recommendation-connection.type';
import { RecommendationType } from './types/recommendation.type';

/**
 * Remaining MVP GraphQL stubs (analysis + history).
 * Auth operations live in AuthModule / UsersModule.
 */
@Resolver()
export class SchemaFoundationResolver {
  @Query(() => RecommendationConnectionType, {
    name: 'recommendationHistory',
    description:
      'Paginated recommendation history for the current user. Implementation: T-106.',
  })
  @UseGuards(GqlAuthGuard)
  recommendationHistory(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 })
    limit?: number,
    @Args('cursor', { type: () => String, nullable: true }) cursor?: string,
  ): never {
    void limit;
    void cursor;
    throw new Error('Not implemented: recommendationHistory (requires T-106)');
  }

  @Query(() => RecommendationType, {
    name: 'recommendation',
    nullable: true,
    description:
      'Single recommendation owned by the current user. Implementation: T-106.',
  })
  @UseGuards(GqlAuthGuard)
  recommendation(@Args('id', { type: () => String }) id: string): never {
    void id;
    throw new Error('Not implemented: recommendation (requires T-106)');
  }

  @Mutation(() => FaceAnalysisResultType, {
    description:
      'Submit landmarks, orchestrate AI, persist history. Implementation: T-105.',
  })
  @UseGuards(GqlAuthGuard)
  analyzeFace(@Args('input') input: AnalyzeFaceInput): never {
    void input;
    throw new Error('Not implemented: analyzeFace (requires T-105)');
  }
}
