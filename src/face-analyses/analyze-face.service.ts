import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AiService } from '../ai/ai.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  RECOMMENDATION_CATEGORY_DB,
  RecommendationCategory,
} from '../common/enums';
import { RecommendationsService } from '../recommendations/recommendations.service';
import { toRecommendationType } from '../recommendations/recommendation.mapper';
import type { AnalyzeFaceInput } from '../schema/inputs/analyze-face.input';
import type { FaceAnalysisResultType } from '../schema/types/face-analysis-result.type';
import { AnalyzeFaceErrors } from './analyze-face.errors';
import { FaceAnalysesService } from './face-analyses.service';

@Injectable()
export class AnalyzeFaceService {
  private readonly logger = new Logger(AnalyzeFaceService.name);

  constructor(
    private readonly faceAnalyses: FaceAnalysesService,
    private readonly recommendations: RecommendationsService,
    private readonly ai: AiService,
    private readonly errors: AnalyzeFaceErrors,
  ) {}

  async analyze(
    user: AuthenticatedUser,
    input: AnalyzeFaceInput,
  ): Promise<FaceAnalysisResultType> {
    this.errors.assertLandmarks(input.landmarks);

    const landmarksPayload = {
      points: input.landmarks.points.map((p) => ({
        x: p.x,
        y: p.y,
        ...(p.z !== undefined && p.z !== null ? { z: p.z } : {}),
        ...(p.index !== undefined && p.index !== null
          ? { index: p.index }
          : {}),
      })),
      ...(input.landmarks.meta
        ? {
            meta: {
              ...(input.landmarks.meta.source
                ? { source: input.landmarks.meta.source }
                : {}),
              ...(input.landmarks.meta.version
                ? { version: input.landmarks.meta.version }
                : {}),
            },
          }
        : {}),
    };

    const analysis = await this.faceAnalyses.createPending(
      user.userId,
      landmarksPayload,
    );
    const requestId = randomUUID();

    try {
      const aiResult = await this.ai.analyzeFace({
        requestId,
        landmarks: landmarksPayload,
      });

      await this.faceAnalyses.markSucceeded(analysis.id, {
        faceShape: aiResult.faceShape,
        rawAiResponse: aiResult,
      });

      const recommendation = await this.recommendations.createFromAnalysis({
        userId: user.userId,
        faceAnalysisId: analysis.id,
        faceShape: aiResult.faceShape,
        category: RECOMMENDATION_CATEGORY_DB[RecommendationCategory.HAIR],
        items: aiResult.recommendations.items.map((item) => ({
          key: item.key,
          title: item.title,
          description: item.description,
          score: item.score,
          metadata: item.metadata,
        })),
      });

      return {
        id: analysis.id,
        faceShape: aiResult.faceShape,
        recommendations: toRecommendationType(recommendation),
      };
    } catch (err) {
      const safeMessage = 'Face analysis failed';
      try {
        await this.faceAnalyses.markFailed(analysis.id, safeMessage);
      } catch (persistErr) {
        this.logger.error(
          `Failed to mark analysis ${analysis.id} as failed`,
          persistErr instanceof Error ? persistErr.stack : undefined,
        );
      }
      this.logger.warn(
        `analyzeFace failed userId=${user.userId} analysisId=${analysis.id} requestId=${requestId}`,
      );
      this.errors.toGraphqlException(err);
    }
  }
}
