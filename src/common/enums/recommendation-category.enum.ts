import { registerEnumType } from '@nestjs/graphql';

/**
 * Recommendation category. MVP uses HAIR only (ADR-007 / ADR-013).
 * Stored in MongoDB as lowercase (`hair`) for catalog alignment;
 * GraphQL exposes uppercase enum values.
 */
export enum RecommendationCategory {
  HAIR = 'HAIR',
}

registerEnumType(RecommendationCategory, {
  name: 'RecommendationCategory',
  description: 'Recommendation domain. MVP ships hair only.',
});

/** MongoDB / AI wire value for hair recommendations. */
export const RECOMMENDATION_CATEGORY_DB = {
  [RecommendationCategory.HAIR]: 'hair',
} as const;

export type RecommendationCategoryDb =
  (typeof RECOMMENDATION_CATEGORY_DB)[RecommendationCategory];
