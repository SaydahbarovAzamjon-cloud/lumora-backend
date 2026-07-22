import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecommendationsService } from './recommendations.service';
import {
  Recommendation,
  RecommendationSchema,
} from './schemas/recommendation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recommendation.name, schema: RecommendationSchema },
    ]),
  ],
  providers: [RecommendationsService],
  exports: [MongooseModule, RecommendationsService],
})
export class RecommendationsModule {}
