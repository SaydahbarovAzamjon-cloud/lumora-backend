import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AiUnavailableError, AiUpstreamError } from '../ai/ai.errors';
import type { FaceLandmarkInput } from '../schema/inputs/analyze-face.input';

/** MediaPipe Face Landmarker typically returns 478 points; allow headroom. */
export const MAX_LANDMARK_POINTS = 600;
export const MIN_LANDMARK_POINTS = 1;

@Injectable()
export class AnalyzeFaceErrors {
  assertLandmarks(landmarks: FaceLandmarkInput): void {
    if (!landmarks?.points || !Array.isArray(landmarks.points)) {
      throw new BadRequestException({
        code: 'INVALID_LANDMARKS',
        message: 'landmarks.points is required',
      });
    }
    if (landmarks.points.length < MIN_LANDMARK_POINTS) {
      throw new BadRequestException({
        code: 'INVALID_LANDMARKS',
        message: 'landmarks.points must include at least one point',
      });
    }
    if (landmarks.points.length > MAX_LANDMARK_POINTS) {
      throw new BadRequestException({
        code: 'INVALID_LANDMARKS',
        message: `landmarks.points exceeds maximum of ${MAX_LANDMARK_POINTS}`,
      });
    }
    for (let i = 0; i < landmarks.points.length; i += 1) {
      const point = landmarks.points[i];
      if (
        !point ||
        typeof point.x !== 'number' ||
        typeof point.y !== 'number' ||
        !Number.isFinite(point.x) ||
        !Number.isFinite(point.y)
      ) {
        throw new BadRequestException({
          code: 'INVALID_LANDMARKS',
          message: `landmarks.points[${i}] requires finite x and y`,
        });
      }
      if (
        point.z !== undefined &&
        point.z !== null &&
        (typeof point.z !== 'number' || !Number.isFinite(point.z))
      ) {
        throw new BadRequestException({
          code: 'INVALID_LANDMARKS',
          message: `landmarks.points[${i}].z must be a finite number when set`,
        });
      }
    }
  }

  /**
   * Map AI/upstream failures to client-safe Nest exceptions (API.md §3.7 / T-107).
   * Never forward stack traces or internal URLs.
   */
  toGraphqlException(err: unknown): never {
    if (err instanceof BadRequestException) {
      throw err;
    }
    if (err instanceof AiUnavailableError) {
      throw new ServiceUnavailableException({
        code: 'AI_UNAVAILABLE',
        message: 'Face analysis is temporarily unavailable. Try again shortly.',
      });
    }
    if (err instanceof AiUpstreamError) {
      const invalid =
        err.code === 'INVALID_LANDMARKS' ||
        err.status === 400 ||
        err.status === 422;
      if (invalid) {
        throw new BadRequestException({
          code: 'INVALID_LANDMARKS',
          message: 'Landmark payload was rejected by the analysis service.',
        });
      }
      throw new ServiceUnavailableException({
        code: 'AI_UPSTREAM_ERROR',
        message: 'Face analysis failed. Please try again.',
      });
    }
    throw new ServiceUnavailableException({
      code: 'ANALYSIS_FAILED',
      message: 'Face analysis failed. Please try again.',
    });
  }
}
