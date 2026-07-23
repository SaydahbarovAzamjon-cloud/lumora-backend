import {
  RECOMMENDATION_CATEGORY_DB,
  RecommendationCategory,
  type RecommendationCategoryDb,
} from '../common/enums';
import type { RecommendationDocument } from './schemas/recommendation.schema';
import type { RecommendationType } from '../schema/types/recommendation.type';

export function categoryToGraphql(category: string): RecommendationCategory {
  const normalized = category.trim().toLowerCase();
  if (normalized === RECOMMENDATION_CATEGORY_DB[RecommendationCategory.HAIR]) {
    return RecommendationCategory.HAIR;
  }
  // Future categories map here; MVP only hair.
  return RecommendationCategory.HAIR;
}

export function categoryToDb(
  category: RecommendationCategory,
): RecommendationCategoryDb {
  return RECOMMENDATION_CATEGORY_DB[category];
}

export function toRecommendationType(
  doc: RecommendationDocument,
): RecommendationType {
  return {
    id: doc.id,
    category: categoryToGraphql(doc.category),
    faceShape: doc.faceShape,
    items: (doc.items ?? []).map((item) => ({
      key: item.key ?? null,
      title: item.title,
      description: item.description ?? null,
      score: item.score ?? null,
      metadata: item.metadata ?? null,
    })),
    createdAt: doc.createdAt,
    faceAnalysisId: String(doc.faceAnalysisId),
  };
}

export type HistoryCursor = {
  createdAt: string;
  id: string;
};

export function encodeHistoryCursor(cursor: HistoryCursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
}

export function decodeHistoryCursor(
  cursor: string | undefined | null,
): HistoryCursor | null {
  if (!cursor) {
    return null;
  }
  try {
    const raw = Buffer.from(cursor, 'base64url').toString('utf8');
    const parsed = JSON.parse(raw) as Partial<HistoryCursor>;
    if (
      typeof parsed.createdAt !== 'string' ||
      typeof parsed.id !== 'string' ||
      !parsed.createdAt ||
      !parsed.id
    ) {
      return null;
    }
    return { createdAt: parsed.createdAt, id: parsed.id };
  } catch {
    return null;
  }
}
