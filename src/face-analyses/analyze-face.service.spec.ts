import { AnalyzeFaceService } from './analyze-face.service';
import { AnalyzeFaceErrors } from './analyze-face.errors';
import { FaceShape } from '../common/enums';
import { AiUnavailableError } from '../ai/ai.errors';

describe('AnalyzeFaceService', () => {
  const user = { userId: '507f1f77bcf86cd799439011', email: 'a@b.com' };

  function buildService(overrides?: {
    aiAnalyze?: jest.Mock;
    createPending?: jest.Mock;
    markSucceeded?: jest.Mock;
    markFailed?: jest.Mock;
    createFromAnalysis?: jest.Mock;
  }) {
    const analysisDoc = {
      id: '507f191e810c19729de860ea',
    };
    const recommendationDoc = {
      id: '507f191e810c19729de860eb',
      category: 'hair',
      faceShape: FaceShape.OVAL,
      items: [{ title: 'Crop', key: 'crop', score: 0.9 }],
      createdAt: new Date('2026-07-22T00:00:00.000Z'),
      faceAnalysisId: analysisDoc.id,
    };

    const faceAnalyses = {
      createPending:
        overrides?.createPending ?? jest.fn().mockResolvedValue(analysisDoc),
      markSucceeded:
        overrides?.markSucceeded ?? jest.fn().mockResolvedValue(analysisDoc),
      markFailed: overrides?.markFailed ?? jest.fn().mockResolvedValue(null),
    };
    const recommendations = {
      createFromAnalysis:
        overrides?.createFromAnalysis ??
        jest.fn().mockResolvedValue(recommendationDoc),
    };
    const ai = {
      analyzeFace:
        overrides?.aiAnalyze ??
        jest.fn().mockResolvedValue({
          faceShape: FaceShape.OVAL,
          recommendations: {
            category: 'hair',
            items: [{ title: 'Crop', key: 'crop', score: 0.9 }],
          },
        }),
    };

    const service = new AnalyzeFaceService(
      faceAnalyses as never,
      recommendations as never,
      ai as never,
      new AnalyzeFaceErrors(),
    );

    return { service, faceAnalyses, recommendations, ai, analysisDoc };
  }

  it('persists succeeded analysis + recommendation on AI success', async () => {
    const { service, faceAnalyses, recommendations } = buildService();
    const result = await service.analyze(user, {
      landmarks: { points: [{ x: 0.1, y: 0.2 }] },
    });

    expect(faceAnalyses.createPending).toHaveBeenCalled();
    expect(faceAnalyses.markSucceeded).toHaveBeenCalled();
    expect(recommendations.createFromAnalysis).toHaveBeenCalled();
    expect(result.faceShape).toBe(FaceShape.OVAL);
    expect(result.recommendations.items[0]?.title).toBe('Crop');
  });

  it('marks analysis failed and does not create recommendation on AI outage', async () => {
    const { service, faceAnalyses, recommendations } = buildService({
      aiAnalyze: jest.fn().mockRejectedValue(new AiUnavailableError()),
    });

    await expect(
      service.analyze(user, {
        landmarks: { points: [{ x: 0.1, y: 0.2 }] },
      }),
    ).rejects.toMatchObject({
      response: { code: 'AI_UNAVAILABLE' },
    });

    expect(faceAnalyses.markFailed).toHaveBeenCalled();
    expect(recommendations.createFromAnalysis).not.toHaveBeenCalled();
  });

  it('rejects invalid landmarks before persistence', async () => {
    const { service, faceAnalyses } = buildService();
    await expect(
      service.analyze(user, { landmarks: { points: [] } }),
    ).rejects.toBeDefined();
    expect(faceAnalyses.createPending).not.toHaveBeenCalled();
  });
});
