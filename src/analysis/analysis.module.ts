import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from '../ai/ai.module';
import { AnalysisResolver } from './analysis.resolver';
import { AnalysisService } from './analysis.service';
import {
  FaceAnalysis,
  FaceAnalysisSchema,
} from './schemas/face-analysis.schema';
import {
  Recommendation,
  RecommendationSchema,
} from './schemas/recommendation.schema';

@Module({
  imports: [
    AiModule,
    MongooseModule.forFeature([
      { name: FaceAnalysis.name, schema: FaceAnalysisSchema },
      { name: Recommendation.name, schema: RecommendationSchema },
    ]),
  ],
  providers: [AnalysisService, AnalysisResolver],
  exports: [AnalysisService],
})
export class AnalysisModule {}
