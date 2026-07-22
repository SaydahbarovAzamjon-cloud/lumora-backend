import {
  categoryToGraphql,
  decodeHistoryCursor,
  encodeHistoryCursor,
} from './recommendation.mapper';
import { RecommendationCategory } from '../common/enums';

describe('recommendation.mapper', () => {
  it('maps hair wire value to GraphQL HAIR', () => {
    expect(categoryToGraphql('hair')).toBe(RecommendationCategory.HAIR);
    expect(categoryToGraphql('HAIR')).toBe(RecommendationCategory.HAIR);
  });

  it('round-trips history cursors', () => {
    const encoded = encodeHistoryCursor({
      createdAt: '2026-07-22T10:00:00.000Z',
      id: '64b64c4f2f1c2b001f3a9a01',
    });
    expect(decodeHistoryCursor(encoded)).toEqual({
      createdAt: '2026-07-22T10:00:00.000Z',
      id: '64b64c4f2f1c2b001f3a9a01',
    });
  });

  it('returns null for corrupt cursors', () => {
    expect(decodeHistoryCursor('not-valid')).toBeNull();
    expect(decodeHistoryCursor(undefined)).toBeNull();
  });
});
