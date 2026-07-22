import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  FaceShape,
  RecommendationCategory,
} from '../enums/analysis.enums';

export type RecommendationDocument = HydratedDocument<Recommendation>;

@Schema({ _id: false })
export class RecommendationItem {
  @Prop({ required: false })
  key?: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  score?: number;
}

export const RecommendationItemSchema =
  SchemaFactory.createForClass(RecommendationItem);

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'recommendations' })
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

  @Prop({
    type: String,
    required: true,
    enum: Object.values(RecommendationCategory),
    default: RecommendationCategory.HAIR,
  })
  category!: RecommendationCategory;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(FaceShape),
  })
  faceShape!: FaceShape;

  @Prop({ type: [RecommendationItemSchema], default: [] })
  items!: RecommendationItem[];

  createdAt!: Date;
}

export const RecommendationSchema =
  SchemaFactory.createForClass(Recommendation);

RecommendationSchema.index({ userId: 1, createdAt: -1 });
