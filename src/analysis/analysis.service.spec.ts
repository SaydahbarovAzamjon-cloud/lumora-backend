import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { AiClientService } from '../ai/ai.client';
import { AnalysisService } from './analysis.service';
import {
  FaceAnalysisStatus,
  FaceShape,
  RecommendationCategory,
} from './enums/analysis.enums';
import { FaceAnalysis } from './schemas/face-analysis.schema';
import { Recommendation } from './schemas/recommendation.schema';

describe('AnalysisService', () => {
  let service: AnalysisService;
  let aiClient: { analyzeFace: jest.Mock };
  let faceAnalysisModel: {
    create: jest.Mock;
  };
  let recommendationModel: {
    create: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
  };

  const pendingDoc = {
    _id: new Types.ObjectId(),
    id: 'analysis-1',
    save: jest.fn(),
    faceShape: undefined as FaceShape | undefined,
    status: FaceAnalysisStatus.PENDING,
    rawAiResponse: undefined as Record<string, unknown> | undefined,
    errorMessage: undefined as string | undefined,
  };

  beforeEach(async () => {
    pendingDoc.save.mockReset();
    pendingDoc.save.mockResolvedValue(pendingDoc);
    pendingDoc.status = FaceAnalysisStatus.PENDING;
    pendingDoc.faceShape = undefined;
    pendingDoc.errorMessage = undefined;

    aiClient = {
      analyzeFace: jest.fn(),
    };
    faceAnalysisModel = {
      create: jest.fn().mockResolvedValue(pendingDoc),
    };
    recommendationModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisService,
        { provide: AiClientService, useValue: aiClient },
        { provide: getModelToken(FaceAnalysis.name), useValue: faceAnalysisModel },
        {
          provide: getModelToken(Recommendation.name),
          useValue: recommendationModel,
        },
      ],
    }).compile();

    service = module.get(AnalysisService);
  });

  it('analyzes face, persists success, and returns recommendations', async () => {
    aiClient.analyzeFace.mockResolvedValue({
      faceShape: 'OVAL',
      recommendations: {
        category: 'hair',
        items: [
          {
            key: 'crop',
            title: 'Textured Crop',
            description: 'Works with oval',
            score: 0.91,
          },
        ],
      },
    });

    const recId = new Types.ObjectId();
    recommendationModel.create.mockResolvedValue({
      id: recId.toHexString(),
      category: RecommendationCategory.HAIR,
      faceShape: FaceShape.OVAL,
      items: [
        {
          key: 'crop',
          title: 'Textured Crop',
          description: 'Works with oval',
          score: 0.91,
        },
      ],
      createdAt: new Date('2026-07-22T00:00:00.000Z'),
      faceAnalysisId: pendingDoc._id,
    });

    const result = await service.analyzeFace('507f1f77bcf86cd799439011', {
      landmarks: {
        points: [
          { x: 0.1, y: 0.2, z: 0 },
          { x: 0.3, y: 0.4 },
          { x: 0.5, y: 0.6 },
        ],
      },
    });

    expect(result.faceShape).toBe(FaceShape.OVAL);
    expect(result.recommendations.items[0].title).toBe('Textured Crop');
    expect(pendingDoc.status).toBe(FaceAnalysisStatus.SUCCEEDED);
    expect(recommendationModel.create).toHaveBeenCalled();
  });

  it('marks analysis failed and does not create recommendation on AI outage', async () => {
    aiClient.analyzeFace.mockRejectedValue(
      new ServiceUnavailableException('down'),
    );

    await expect(
      service.analyzeFace('507f1f77bcf86cd799439011', {
        landmarks: {
          points: [
            { x: 0.1, y: 0.2 },
            { x: 0.3, y: 0.4 },
            { x: 0.5, y: 0.6 },
          ],
        },
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);

    expect(pendingDoc.status).toBe(FaceAnalysisStatus.FAILED);
    expect(recommendationModel.create).not.toHaveBeenCalled();
  });

  it('rejects unknown face shapes from AI', async () => {
    aiClient.analyzeFace.mockResolvedValue({
      faceShape: 'HEXAGON',
      recommendations: {
        category: 'hair',
        items: [{ title: 'X' }],
      },
    });

    await expect(
      service.analyzeFace('507f1f77bcf86cd799439011', {
        landmarks: {
          points: [
            { x: 0.1, y: 0.2 },
            { x: 0.3, y: 0.4 },
            { x: 0.5, y: 0.6 },
          ],
        },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(recommendationModel.create).not.toHaveBeenCalled();
  });
});
