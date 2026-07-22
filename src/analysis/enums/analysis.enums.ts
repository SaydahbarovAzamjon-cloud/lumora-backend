import { registerEnumType } from '@nestjs/graphql';

export enum FaceShape {
  OVAL = 'OVAL',
  ROUND = 'ROUND',
  SQUARE = 'SQUARE',
  HEART = 'HEART',
  OBLONG = 'OBLONG',
  DIAMOND = 'DIAMOND',
  TRIANGLE = 'TRIANGLE',
  OTHER = 'OTHER',
}

registerEnumType(FaceShape, {
  name: 'FaceShape',
  description: 'Fixed face-shape taxonomy (ADR-012)',
});

export enum RecommendationCategory {
  HAIR = 'HAIR',
}

registerEnumType(RecommendationCategory, {
  name: 'RecommendationCategory',
});

export enum FaceAnalysisStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}
