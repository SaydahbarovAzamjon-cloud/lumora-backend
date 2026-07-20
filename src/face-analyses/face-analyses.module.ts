import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FaceAnalysis,
  FaceAnalysisSchema,
} from './schemas/face-analysis.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FaceAnalysis.name, schema: FaceAnalysisSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class FaceAnalysesModule {}
