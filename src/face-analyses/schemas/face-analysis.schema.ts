import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AnalysisStatus, FaceShape } from '../../common/enums';

export type FaceAnalysisDocument = HydratedDocument<FaceAnalysis>;

/**
 * One analysis attempt/session for a user (DATABASE.md §5.2).
 * Landmarks-only payload — no face images (ADR-011).
 */
@Schema({
  collection: 'face_analyses',
  timestamps: true,
})
export class FaceAnalysis {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  /**
   * MediaPipe landmark payload (normalized).
   * Exact point schema is OPEN-004; stored as Mixed until contract freezes.
   */
  @Prop({ type: Object, required: false })
  landmarks?: Record<string, unknown>;

  @Prop({
    type: String,
    required: false,
    enum: Object.values(FaceShape),
  })
  faceShape?: FaceShape;

  /** Optional AI audit payload — do not store secrets. */
  @Prop({ type: Object, required: false })
  rawAiResponse?: Record<string, unknown>;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(AnalysisStatus),
    default: AnalysisStatus.PENDING,
  })
  status!: AnalysisStatus;

  /** Safe failure reason for ops/UI — never raw stack traces. */
  @Prop({ type: String, required: false })
  errorMessage?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const FaceAnalysisSchema = SchemaFactory.createForClass(FaceAnalysis);

FaceAnalysisSchema.index({ userId: 1, createdAt: -1 });
FaceAnalysisSchema.index({ status: 1 });
