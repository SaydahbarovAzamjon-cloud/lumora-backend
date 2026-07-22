import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { FaceAnalysisStatus, FaceShape } from '../enums/analysis.enums';

export type FaceAnalysisDocument = HydratedDocument<FaceAnalysis>;

@Schema({ timestamps: true, collection: 'face_analyses' })
export class FaceAnalysis {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Object, required: true })
  landmarks!: Record<string, unknown>;

  @Prop({
    type: String,
    required: false,
    enum: Object.values(FaceShape),
  })
  faceShape?: FaceShape;

  @Prop({ type: Object, required: false })
  rawAiResponse?: Record<string, unknown>;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(FaceAnalysisStatus),
    default: FaceAnalysisStatus.PENDING,
  })
  status!: FaceAnalysisStatus;

  @Prop({ required: false })
  errorMessage?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const FaceAnalysisSchema = SchemaFactory.createForClass(FaceAnalysis);

FaceAnalysisSchema.index({ userId: 1, createdAt: -1 });
FaceAnalysisSchema.index({ status: 1 });
