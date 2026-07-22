import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { FaceShape } from '../common/enums';
import type { RecommendationConnectionType } from '../schema/types/recommendation-connection.type';
import type { RecommendationType } from '../schema/types/recommendation.type';
import {
  decodeHistoryCursor,
  encodeHistoryCursor,
  toRecommendationType,
} from './recommendation.mapper';
import {
  Recommendation,
  RecommendationDocument,
  RecommendationItem,
} from './schemas/recommendation.schema';

export type CreateRecommendationInput = {
  userId: string;
  faceAnalysisId: string;
  faceShape: FaceShape;
  category: string;
  items: RecommendationItem[];
};

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectModel(Recommendation.name)
    private readonly recommendationModel: Model<RecommendationDocument>,
  ) {}

  async createFromAnalysis(
    input: CreateRecommendationInput,
  ): Promise<RecommendationDocument> {
    return this.recommendationModel.create({
      userId: new Types.ObjectId(input.userId),
      faceAnalysisId: new Types.ObjectId(input.faceAnalysisId),
      faceShape: input.faceShape,
      category: input.category,
      items: input.items,
    });
  }

  async findHistoryForUser(
    userId: string,
    limit = 20,
    cursor?: string | null,
  ): Promise<RecommendationConnectionType> {
    const safeLimit = Math.min(Math.max(limit || 20, 1), 50);
    const decoded = decodeHistoryCursor(cursor);
    if (cursor && !decoded) {
      throw new BadRequestException({
        code: 'INVALID_CURSOR',
        message: 'Invalid history cursor',
      });
    }

    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };

    if (decoded) {
      const createdAt = new Date(decoded.createdAt);
      if (
        Number.isNaN(createdAt.getTime()) ||
        !Types.ObjectId.isValid(decoded.id)
      ) {
        throw new BadRequestException({
          code: 'INVALID_CURSOR',
          message: 'Invalid history cursor',
        });
      }
      // createdAt DESC, _id DESC pagination
      filter.$or = [
        { createdAt: { $lt: createdAt } },
        {
          createdAt,
          _id: { $lt: new Types.ObjectId(decoded.id) },
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
    const nodes = page.map((doc) => toRecommendationType(doc));

    let nextCursor: string | null = null;
    if (hasMore && page.length > 0) {
      const last = page[page.length - 1];
      nextCursor = encodeHistoryCursor({
        createdAt: last.createdAt.toISOString(),
        id: last.id,
      });
    }

    return { nodes, nextCursor };
  }

  /**
   * Owner-scoped lookup. Missing or other-user docs both return null (no IDOR leak).
   */
  async findOwnedById(
    userId: string,
    id: string,
  ): Promise<RecommendationType | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await this.recommendationModel
      .findOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      })
      .exec();
    return doc ? toRecommendationType(doc) : null;
  }
}
