import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AnalysisStatus, FaceShape } from '../common/enums';
import {
  FaceAnalysis,
  FaceAnalysisDocument,
} from './schemas/face-analysis.schema';

@Injectable()
export class FaceAnalysesService {
  constructor(
    @InjectModel(FaceAnalysis.name)
    private readonly faceAnalysisModel: Model<FaceAnalysisDocument>,
  ) {}

  async createPending(
    userId: string,
    landmarks: Record<string, unknown>,
  ): Promise<FaceAnalysisDocument> {
    return this.faceAnalysisModel.create({
      userId: new Types.ObjectId(userId),
      landmarks,
      status: AnalysisStatus.PENDING,
    });
  }

  async markSucceeded(
    id: string,
    input: {
      faceShape: FaceShape;
      rawAiResponse: Record<string, unknown>;
    },
  ): Promise<FaceAnalysisDocument | null> {
    return this.faceAnalysisModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            faceShape: input.faceShape,
            rawAiResponse: input.rawAiResponse,
            status: AnalysisStatus.SUCCEEDED,
          },
          $unset: { errorMessage: 1 },
        },
        { new: true },
      )
      .exec();
  }

  async markFailed(
    id: string,
    errorMessage: string,
  ): Promise<FaceAnalysisDocument | null> {
    return this.faceAnalysisModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            status: AnalysisStatus.FAILED,
            errorMessage,
          },
        },
        { new: true },
      )
      .exec();
  }
}
