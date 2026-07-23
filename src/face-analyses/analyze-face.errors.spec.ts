import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AiUnavailableError, AiUpstreamError } from '../ai/ai.errors';
import { AnalyzeFaceErrors } from './analyze-face.errors';

describe('AnalyzeFaceErrors', () => {
  const errors = new AnalyzeFaceErrors();

  it('rejects empty landmark points', () => {
    expect(() => errors.assertLandmarks({ points: [] })).toThrow(
      BadRequestException,
    );
  });

  it('rejects non-finite coordinates', () => {
    expect(() =>
      errors.assertLandmarks({
        points: [{ x: Number.NaN, y: 0.1 }],
      }),
    ).toThrow(BadRequestException);
  });

  it('accepts a minimal valid payload', () => {
    expect(() =>
      errors.assertLandmarks({
        points: [{ x: 0.1, y: 0.2, z: 0.3, index: 1 }],
      }),
    ).not.toThrow();
  });

  it('maps AiUnavailableError to ServiceUnavailableException', () => {
    expect(() => errors.toGraphqlException(new AiUnavailableError())).toThrow(
      ServiceUnavailableException,
    );
  });

  it('maps INVALID_LANDMARKS upstream to BadRequestException', () => {
    expect(() =>
      errors.toGraphqlException(
        new AiUpstreamError('bad', 'INVALID_LANDMARKS', 422),
      ),
    ).toThrow(BadRequestException);
  });
});
