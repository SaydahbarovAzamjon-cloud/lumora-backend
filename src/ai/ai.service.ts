import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { FaceShape } from '../common/enums';
import {
  AiInvalidResponseError,
  AiUnavailableError,
  AiUpstreamError,
} from './ai.errors';
import type {
  AiAnalyzeFaceRequest,
  AiAnalyzeFaceSuccess,
  AiErrorBody,
  AiRecommendationItem,
} from './ai.types';

const DEFAULT_TIMEOUT_MS = 15_000;
const FACE_SHAPES = new Set<string>(Object.values(FaceShape));

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Call FastAPI `POST /v1/analyze/face` (API.md §4.2 / ADR-019).
   * Sends `X-API-KEY` when `AI_API_KEY` is configured (required in production).
   */
  async analyzeFace(
    request: AiAnalyzeFaceRequest,
  ): Promise<AiAnalyzeFaceSuccess> {
    if (this.isMockEnabled()) {
      return this.mockAnalyzeFace(request);
    }

    const baseUrl = this.requireBaseUrl();
    const timeoutMs = this.resolveTimeoutMs();
    const requestId = request.requestId ?? randomUUID();
    const url = `${baseUrl.replace(/\/$/, '')}/v1/analyze/face`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Request-Id': requestId,
    };

    const apiKey = this.config.get<string>('AI_API_KEY')?.trim();
    if (apiKey) {
      headers['X-API-KEY'] = apiKey;
    } else if (this.isProduction()) {
      throw new AiUnavailableError(
        'AI_API_KEY is required in production (ADR-019)',
      );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...request, requestId }),
        signal: controller.signal,
      });
    } catch (err) {
      const aborted =
        err instanceof Error &&
        (err.name === 'AbortError' || err.message.includes('aborted'));
      this.logger.warn(
        `AI analyzeFace transport failure requestId=${requestId} aborted=${aborted}`,
      );
      throw new AiUnavailableError(
        aborted ? 'AI service timed out' : 'AI service unreachable',
      );
    } finally {
      clearTimeout(timer);
    }

    const bodyText = await response.text();
    const parsed = this.parseJson(bodyText);

    if (!response.ok) {
      const code =
        (parsed as AiErrorBody | null)?.error?.code ??
        `HTTP_${response.status}`;
      const message =
        (parsed as AiErrorBody | null)?.error?.message ??
        'AI service rejected the request';

      if (response.status === 400 || response.status === 422) {
        throw new AiUpstreamError(message, code, response.status);
      }
      if (response.status === 503 || response.status === 504) {
        throw new AiUnavailableError(message);
      }
      throw new AiUpstreamError(message, code, response.status);
    }

    return this.assertSuccessPayload(parsed);
  }

  async health(): Promise<boolean> {
    if (this.isMockEnabled()) {
      return true;
    }
    const baseUrl = this.config.get<string>('AI_BASE_URL')?.trim();
    if (!baseUrl) {
      return false;
    }
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3_000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private requireBaseUrl(): string {
    const baseUrl = this.config.get<string>('AI_BASE_URL')?.trim();
    if (!baseUrl) {
      throw new AiUnavailableError('AI_BASE_URL is not configured');
    }
    return baseUrl;
  }

  private resolveTimeoutMs(): number {
    const raw = this.config.get<string>('AI_TIMEOUT_MS');
    const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_TIMEOUT_MS;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
  }

  private isProduction(): boolean {
    return this.config.get<string>('NODE_ENV') === 'production';
  }

  private isMockEnabled(): boolean {
    const flag = this.config.get<string>('AI_MOCK')?.trim().toLowerCase();
    return flag === '1' || flag === 'true' || flag === 'yes';
  }

  private mockAnalyzeFace(request: AiAnalyzeFaceRequest): AiAnalyzeFaceSuccess {
    const pointCount = request.landmarks.points.length;
    const shapes = Object.values(FaceShape);
    const faceShape = shapes[pointCount % shapes.length] ?? FaceShape.OTHER;
    return {
      faceShape,
      recommendations: {
        category: 'hair',
        items: [
          {
            key: 'mock-textured-crop',
            title: 'Textured Crop',
            description: 'Mock recommendation for local development (AI_MOCK).',
            score: 0.9,
          },
          {
            key: 'mock-side-part',
            title: 'Classic Side Part',
            description: 'Secondary mock style for demos.',
            score: 0.78,
          },
        ],
      },
    };
  }

  private parseJson(bodyText: string): unknown {
    if (!bodyText.trim()) {
      return null;
    }
    try {
      return JSON.parse(bodyText) as unknown;
    } catch {
      throw new AiInvalidResponseError('AI returned non-JSON body');
    }
  }

  private assertSuccessPayload(raw: unknown): AiAnalyzeFaceSuccess {
    if (!raw || typeof raw !== 'object') {
      throw new AiInvalidResponseError('AI success body missing');
    }
    const body = raw as Record<string, unknown>;
    const faceShape = body.faceShape;
    if (typeof faceShape !== 'string' || !FACE_SHAPES.has(faceShape)) {
      throw new AiInvalidResponseError('AI faceShape is missing or invalid');
    }

    const recommendations = body.recommendations;
    if (!recommendations || typeof recommendations !== 'object') {
      throw new AiInvalidResponseError('AI recommendations missing');
    }
    const rec = recommendations as Record<string, unknown>;
    const category =
      typeof rec.category === 'string' ? rec.category.toLowerCase() : '';
    if (category !== 'hair') {
      throw new AiInvalidResponseError(
        'AI recommendations.category must be hair for MVP',
      );
    }
    if (!Array.isArray(rec.items) || rec.items.length < 1) {
      throw new AiInvalidResponseError(
        'AI recommendations.items must include at least one item',
      );
    }

    const items: AiRecommendationItem[] = rec.items.map((item, index) => {
      if (!item || typeof item !== 'object') {
        throw new AiInvalidResponseError(
          `AI recommendations.items[${index}] is invalid`,
        );
      }
      const row = item as Record<string, unknown>;
      if (typeof row.title !== 'string' || !row.title.trim()) {
        throw new AiInvalidResponseError(
          `AI recommendations.items[${index}].title is required`,
        );
      }
      return {
        key: typeof row.key === 'string' ? row.key : undefined,
        title: row.title.trim(),
        description:
          typeof row.description === 'string' ? row.description : undefined,
        score: typeof row.score === 'number' ? row.score : undefined,
        metadata:
          row.metadata && typeof row.metadata === 'object'
            ? (row.metadata as Record<string, unknown>)
            : undefined,
      };
    });

    return {
      faceShape: faceShape as FaceShape,
      recommendations: {
        category: 'hair',
        items,
      },
    };
  }
}
