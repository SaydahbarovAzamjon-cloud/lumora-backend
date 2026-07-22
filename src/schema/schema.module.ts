import { Module } from '@nestjs/common';
import { FaceAnalysesModule } from '../face-analyses/face-analyses.module';
import { RecommendationsModule } from '../recommendations/recommendations.module';
import { SchemaFoundationResolver } from './schema-foundation.resolver';

@Module({
  imports: [FaceAnalysesModule, RecommendationsModule],
  providers: [SchemaFoundationResolver],
})
export class SchemaModule {}
