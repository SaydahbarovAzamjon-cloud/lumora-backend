import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { App } from 'supertest/types';
import { AiClientService } from '../src/ai/ai.client';
import { AppModule } from './../src/app.module';

describe('Lumora GraphQL (e2e)', () => {
  let app: INestApplication<App>;
  let mongo: MongoMemoryServer;
  const aiClient = {
    analyzeFace: jest.fn(),
  };

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri();
    process.env.JWT_SECRET = 'test-jwt-secret-please-change';
    process.env.JWT_ACCESS_EXPIRES_IN = '1h';
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AiClientService)
      .useValue(aiClient)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongo.stop();
  });

  beforeEach(() => {
    aiClient.analyzeFace.mockReset();
  });

  it('GET /health', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('registers, logs in, analyzes face, and reads history', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation Register($input: RegisterInput!) {
            register(input: $input) {
              accessToken
              refreshToken
              user { id email displayName }
            }
          }
        `,
        variables: {
          input: {
            email: 'mvp@lumora.test',
            password: 'password1',
            displayName: 'MVP',
          },
        },
      })
      .expect(200);

    expect(registerRes.body.errors).toBeUndefined();
    expect(registerRes.body.data.register.refreshToken).toBeNull();

    const loginRes = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation Login($input: LoginInput!) {
            login(input: $input) {
              accessToken
              user { email }
            }
          }
        `,
        variables: {
          input: { email: 'mvp@lumora.test', password: 'password1' },
        },
      })
      .expect(200);

    const token = loginRes.body.data.login.accessToken as string;

    aiClient.analyzeFace.mockResolvedValue({
      faceShape: 'OVAL',
      recommendations: {
        category: 'hair',
        items: [
          {
            key: 'crop',
            title: 'Textured Crop',
            description: 'Clean sides',
            score: 0.9,
          },
        ],
      },
    });

    const analyzeRes = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: `
          mutation Analyze($input: AnalyzeFaceInput!) {
            analyzeFace(input: $input) {
              id
              faceShape
              recommendations {
                id
                category
                faceShape
                items { key title score }
                faceAnalysisId
              }
            }
          }
        `,
        variables: {
          input: {
            landmarks: {
              points: [
                { x: 0.1, y: 0.2, z: 0, index: 0 },
                { x: 0.3, y: 0.4, index: 1 },
                { x: 0.5, y: 0.6, index: 2 },
              ],
              meta: { source: 'mediapipe', version: 'test' },
            },
          },
        },
      })
      .expect(200);

    expect(analyzeRes.body.errors).toBeUndefined();
    expect(analyzeRes.body.data.analyzeFace.faceShape).toBe('OVAL');
    expect(
      analyzeRes.body.data.analyzeFace.recommendations.items[0].title,
    ).toBe('Textured Crop');

    const recId = analyzeRes.body.data.analyzeFace.recommendations
      .id as string;

    const historyRes = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: `
          query History {
            recommendationHistory(limit: 10) {
              items { id faceShape category }
              nextCursor
            }
          }
        `,
      })
      .expect(200);

    expect(historyRes.body.errors).toBeUndefined();
    expect(historyRes.body.data.recommendationHistory.items).toHaveLength(1);

    const oneOk = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: `
          query One($id: ID!) {
            recommendation(id: $id) { id faceShape }
          }
        `,
        variables: { id: recId },
      })
      .expect(200);

    expect(oneOk.body.errors).toBeUndefined();
    expect(oneOk.body.data.recommendation.faceShape).toBe('OVAL');

    const badLogin = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation Login($input: LoginInput!) {
            login(input: $input) { accessToken }
          }
        `,
        variables: {
          input: { email: 'mvp@lumora.test', password: 'wrong-pass' },
        },
      })
      .expect(200);

    expect(badLogin.body.errors).toBeDefined();
  });
});
