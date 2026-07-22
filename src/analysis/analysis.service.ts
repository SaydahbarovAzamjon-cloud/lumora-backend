import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'node:crypto';
import { AiClientService } from '../ai/ai.client';
import { AnalyzeFaceInput } from './dto/analyze-face.input';
import {
  FaceAnalysisStatus,
  FaceShape,
  RecommendationCategory,
} from './enums/analysis.enums';
import {
  FaceAnalysisResult,
  RecommendationConnection,
  RecommendationModel,
} from './models/analysis.models';
import {
  FaceAnalysis,
  FaceAnalysisDocument,
} from './schemas/face-analysis.schema';
import {
  Recommendation,
  RecommendationDocument,
} from './schemas/recommendation.schema';

const FACE_SHAPES = new Set(Object.values(FaceShape));

@Injectable()
export class AnalysisService {
  constructor(
    @InjectModel(FaceAnalysis.name)
    private readonly faceAnalysisModel: Model<FaceAnalysisDocument>,
    @InjectModel(Recommendation.name)
    private readonly recommendationModel: Model<RecommendationDocument>,
    private readonly aiClient: AiClientService,
  ) {}

  async analyzeFace(
    userId: string,
    input: AnalyzeFaceInput,
  ): Promise<FaceAnalysisResult> {
    const userObjectId = new Types.ObjectId(userId);
    const landmarksPayload = {
      points: input.landmarks.points.map((p) => ({
        x: p.x,
        y: p.y,
        ...(p.z !== undefined ? { z: p.z } : {}),
        ...(p.index !== undefined ? { index: p.index } : {}),
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
              ...(input.landmarks.meta.imageWidth
                ? { imageWidth: input.landmarks.meta.imageWidth }
                : {}),
              ...(input.landmarks.meta.imageHeight
                ? { imageHeight: input.landmarks.meta.imageHeight }
                : {}),
            },
          }
        : {}),
    };

    const pending = await this.faceAnalysisModel.create({
      userId: userObjectId,
      landmarks: landmarksPayload,
      status: FaceAnalysisStatus.PENDING,
    });

    try {
      const aiResponse = await this.aiClient.analyzeFace({
        requestId: randomUUID(),
        landmarks: landmarksPayload,
      });

      const faceShape = this.parseFaceShape(aiResponse.faceShape);
      const items = (aiResponse.recommendations?.items ?? []).map((item) => ({
        key: item.key,
        title: item.title,
        description: item.description,
        score: item.score,
      }));

      if (!items.length || !items.every((i) => i.title)) {
        throw new BadRequestException('AI returned invalid recommendations');
      }

      pending.faceShape = faceShape;
      pending.status = FaceAnalysisStatus.SUCCEEDED;
      pending.rawAiResponse = aiResponse as unknown as Record<string, unknown>;
      pending.errorMessage = undefined;
      await pending.save();

      const recommendation = await this.recommendationModel.create({
        userId: userObjectId,
        faceAnalysisId: pending._id,
        category: RecommendationCategory.HAIR,
        faceShape,
        items,
      });

      return {
        id: pending.id,
        faceShape,
        recommendations: this.toRecommendationModel(recommendation),
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Face analysis failed';

      pending.status = FaceAnalysisStatus.FAILED;
      pending.errorMessage = message.slice(0, 500);
      await pending.save();

      throw error;
    }
  }

  async recommendationHistory(
    userId: string,
    limit = 20,
    cursor?: string,
  ): Promise<RecommendationConnection> {
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };

    if (cursor) {
      if (!Types.ObjectId.isValid(cursor)) {
        throw new BadRequestException('Invalid cursor');
      }
      const cursorDoc = await this.recommendationModel
        .findOne({
          _id: new Types.ObjectId(cursor),
          userId: new Types.ObjectId(userId),
        })
        .exec();
      if (!cursorDoc) {
        throw new BadRequestException('Invalid cursor');
      }
      filter.$or = [
        { createdAt: { $lt: cursorDoc.createdAt } },
        {
          createdAt: cursorDoc.createdAt,
          _id: { $lt: cursorDoc._id },
        },
      ];
    }

    const rows = await this.recommendationModel
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(safeLimit + 1)
      .exec();

    const hasMore = rows.length > safeLimit;
    const page = hasMore ? rows.slice(0, safeLimit) : rows;

    return {
      items: page.map((row) => this.toRecommendationModel(row)),
      nextCursor: hasMore ? page[page.length - 1].id : null,
    };
  }

  async recommendation(
    userId: string,
    id: string,
  ): Promise<RecommendationModel | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const row = await this.recommendationModel
      .findOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!row) {
      return null;
    }

    return this.toRecommendationModel(row);
  }

  async recommendationOrThrow(
    userId: string,
    id: string,
  ): Promise<RecommendationModel> {
    const row = await this.recommendation(userId, id);
    if (!row) {
      throw new NotFoundException('Recommendation not found');
    }
    return row;
  }

  private parseFaceShape(value: string): FaceShape {
    const normalized = (value ?? '').toUpperCase() as FaceShape;
    if (!FACE_SHAPES.has(normalized)) {
      throw new BadRequestException('AI returned an unknown face shape');
    }
    return normalized;
  }

  private toRecommendationModel(
    doc: RecommendationDocument,
  ): RecommendationModel {
    return {
      id: doc.id,
      category: doc.category,
      faceShape: doc.faceShape,
      items: (doc.items ?? []).map((item) => ({
        key: item.key ?? null,
        title: item.title,
        description: item.description ?? null,
        score: item.score ?? null,
      })),
      createdAt: doc.createdAt,
      faceAnalysisId: String(doc.faceAnalysisId),
    };
  }
}
