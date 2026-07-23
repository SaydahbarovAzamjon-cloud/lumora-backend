import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { AnalyzeFaceService } from '../face-analyses/analyze-face.service';
import { RecommendationsService } from '../recommendations/recommendations.service';
import { AnalyzeFaceInput } from './inputs/analyze-face.input';
import { FaceAnalysisResultType } from './types/face-analysis-result.type';
import { RecommendationConnectionType } from './types/recommendation-connection.type';
import { RecommendationType } from './types/recommendation.type';

@Resolver()
export class SchemaFoundationResolver {
  constructor(
    private readonly analyzeFaceService: AnalyzeFaceService,
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Query(() => RecommendationConnectionType, {
    name: 'recommendationHistory',
    description: 'Paginated recommendation history for the current user.',
  })
  @UseGuards(GqlAuthGuard)
  recommendationHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 })
    limit?: number,
    @Args('cursor', { type: () => String, nullable: true }) cursor?: string,
  ): Promise<RecommendationConnectionType> {
    return this.recommendationsService.findHistoryForUser(
      user.userId,
      limit,
      cursor,
    );
  }

  @Query(() => RecommendationType, {
    name: 'recommendation',
    nullable: true,
    description:
      'Single recommendation owned by the current user. Returns null if missing or not owned.',
  })
  @UseGuards(GqlAuthGuard)
  recommendation(
    @CurrentUser() user: AuthenticatedUser,
    @Args('id', { type: () => String }) id: string,
  ): Promise<RecommendationType | null> {
    return this.recommendationsService.findOwnedById(user.userId, id);
  }

  @Mutation(() => FaceAnalysisResultType, {
    description:
      'Submit landmarks, call FastAPI AI, persist analysis + hair recommendation.',
  })
  @UseGuards(GqlAuthGuard)
  analyzeFace(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: AnalyzeFaceInput,
  ): Promise<FaceAnalysisResultType> {
    return this.analyzeFaceService.analyze(user, input);
  }
}
