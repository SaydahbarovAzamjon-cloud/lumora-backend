import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { FaceShape } from '../../common/enums';

export type RecommendationDocument = HydratedDocument<Recommendation>;

@Schema({ _id: false })
export class RecommendationItem {
  /** Stable catalog key when available (e.g. `short-textured-crop`). */
  @Prop({ type: String, required: false, trim: true })
  key?: string;

  @Prop({ type: String, required: true, trim: true })
  title!: string;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: Number, required: false })
  score?: number;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, unknown>;
}

export const RecommendationItemSchema =
  SchemaFactory.createForClass(RecommendationItem);

/**
 * Hair recommendation result + history projection (DATABASE.md §5.3).
 * Category stored as lowercase wire value (`hair`) for AI catalog alignment.
 */
@Schema({
  collection: 'recommendations',
  timestamps: { createdAt: true, updatedAt: false },
})
export class Recommendation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'FaceAnalysis',
    required: true,
    index: true,
  })
  faceAnalysisId!: Types.ObjectId;

  /** MVP: always `hair` (ADR-013 / ADR-021). */
  @Prop({ type: String, required: true, default: 'hair', trim: true })
  category!: string;

  /** Denormalized for fast history UI without joining analyses. */
  @Prop({
    type: String,
    required: true,
    enum: Object.values(FaceShape),
  })
  faceShape!: FaceShape;

  @Prop({ type: [RecommendationItemSchema], required: true, default: [] })
  items!: RecommendationItem[];

  createdAt!: Date;
}

export const RecommendationSchema =
  SchemaFactory.createForClass(Recommendation);

RecommendationSchema.index({ userId: 1, createdAt: -1 });
RecommendationSchema.index({ faceAnalysisId: 1 });
