import { ConfigService } from '@nestjs/config';
import { FaceShape } from '../common/enums';
import {
  AiInvalidResponseError,
  AiUnavailableError,
  AiUpstreamError,
} from './ai.errors';
import { AiService } from './ai.service';

function buildService(env: Record<string, string | undefined>): AiService {
  const config = {
    get: (key: string) => env[key],
  } as ConfigService;
  return new AiService(config);
}

describe('AiService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns mock payload when AI_MOCK is enabled', async () => {
    const service = buildService({ AI_MOCK: 'true' });
    const result = await service.analyzeFace({
      landmarks: {
        points: [
          { x: 0.1, y: 0.2 },
          { x: 0.3, y: 0.4 },
        ],
      },
    });
    expect(Object.values(FaceShape)).toContain(result.faceShape);
    expect(result.recommendations.category).toBe('hair');
    expect(result.recommendations.items.length).toBeGreaterThanOrEqual(1);
  });

  it('posts to FastAPI with X-API-KEY and maps success', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            faceShape: 'OVAL',
            recommendations: {
              category: 'hair',
              items: [{ key: 'crop', title: 'Crop', score: 0.91 }],
            },
          }),
        ),
    });
    global.fetch = fetchMock;

    const service = buildService({
      AI_BASE_URL: 'http://ai.internal:8000',
      AI_API_KEY: 'secret-key',
      AI_TIMEOUT_MS: '5000',
    });

    const result = await service.analyzeFace({
      requestId: 'req-1',
      landmarks: { points: [{ x: 0, y: 0, index: 0 }] },
    });

    expect(result.faceShape).toBe(FaceShape.OVAL);
    expect(result.recommendations.items[0]?.title).toBe('Crop');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://ai.internal:8000/v1/analyze/face');
    expect((init.headers as Record<string, string>)['X-API-KEY']).toBe(
      'secret-key',
    );
  });

  it('maps 422 to AiUpstreamError', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 422,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            error: { code: 'INVALID_LANDMARKS', message: 'incomplete' },
          }),
        ),
    });

    const service = buildService({ AI_BASE_URL: 'http://ai.internal:8000' });
    await expect(
      service.analyzeFace({ landmarks: { points: [{ x: 0, y: 0 }] } }),
    ).rejects.toBeInstanceOf(AiUpstreamError);
  });

  it('maps transport failure to AiUnavailableError', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error('connect ECONNREFUSED'));

    const service = buildService({ AI_BASE_URL: 'http://ai.internal:8000' });
    await expect(
      service.analyzeFace({ landmarks: { points: [{ x: 0, y: 0 }] } }),
    ).rejects.toBeInstanceOf(AiUnavailableError);
  });

  it('rejects invalid success payloads', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            faceShape: 'NOT_A_SHAPE',
            recommendations: { category: 'hair', items: [{ title: 'x' }] },
          }),
        ),
    });

    const service = buildService({ AI_BASE_URL: 'http://ai.internal:8000' });
    await expect(
      service.analyzeFace({ landmarks: { points: [{ x: 0, y: 0 }] } }),
    ).rejects.toBeInstanceOf(AiInvalidResponseError);
  });

  it('requires AI_API_KEY in production', async () => {
    const service = buildService({
      NODE_ENV: 'production',
      AI_BASE_URL: 'http://ai.internal:8000',
    });
    await expect(
      service.analyzeFace({ landmarks: { points: [{ x: 0, y: 0 }] } }),
    ).rejects.toBeInstanceOf(AiUnavailableError);
  });
});
