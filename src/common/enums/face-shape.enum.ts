import { registerEnumType } from '@nestjs/graphql';

/**
 * Face shape taxonomy (ADR-012).
 * Stored in MongoDB as the same string values and exposed in GraphQL.
 */
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
  description: 'Detected face shape from landmark analysis (ADR-012).',
});
