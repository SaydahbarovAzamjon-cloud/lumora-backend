import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { UserModel } from '../auth/models/user.model';
import { AnalysisService } from './analysis.service';
import { AnalyzeFaceInput } from './dto/analyze-face.input';
import {
  FaceAnalysisResult,
  RecommendationConnection,
  RecommendationModel,
} from './models/analysis.models';

@Resolver()
export class AnalysisResolver {
  constructor(private readonly analysisService: AnalysisService) {}

  @Mutation(() => FaceAnalysisResult)
  @UseGuards(GqlAuthGuard)
  analyzeFace(
    @CurrentUser() user: UserModel,
    @Args('input') input: AnalyzeFaceInput,
  ): Promise<FaceAnalysisResult> {
    return this.analysisService.analyzeFace(user.id, input);
  }

  @Query(() => RecommendationConnection)
  @UseGuards(GqlAuthGuard)
  recommendationHistory(
    @CurrentUser() user: UserModel,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 })
    limit?: number,
    @Args('cursor', { type: () => String, nullable: true })
    cursor?: string,
  ): Promise<RecommendationConnection> {
    return this.analysisService.recommendationHistory(
      user.id,
      limit ?? 20,
      cursor,
    );
  }

  @Query(() => RecommendationModel, { nullable: true })
  @UseGuards(GqlAuthGuard)
  recommendation(
    @CurrentUser() user: UserModel,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<RecommendationModel | null> {
    return this.analysisService.recommendation(user.id, id);
  }
}
