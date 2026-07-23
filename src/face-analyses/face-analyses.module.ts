import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from '../ai/ai.module';
import { RecommendationsModule } from '../recommendations/recommendations.module';
import { AnalyzeFaceErrors } from './analyze-face.errors';
import { AnalyzeFaceService } from './analyze-face.service';
import { FaceAnalysesService } from './face-analyses.service';
import {
  FaceAnalysis,
  FaceAnalysisSchema,
} from './schemas/face-analysis.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FaceAnalysis.name, schema: FaceAnalysisSchema },
    ]),
    AiModule,
    RecommendationsModule,
  ],
  providers: [FaceAnalysesService, AnalyzeFaceService, AnalyzeFaceErrors],
  exports: [MongooseModule, FaceAnalysesService, AnalyzeFaceService],
})
export class FaceAnalysesModule {}
