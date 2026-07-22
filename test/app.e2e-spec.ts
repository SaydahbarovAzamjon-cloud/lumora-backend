import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Auth GraphQL (e2e)', () => {
  let app: INestApplication<App>;
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri();
    process.env.JWT_SECRET = 'test-jwt-secret-please-change';
    process.env.JWT_ACCESS_EXPIRES_IN = '1h';
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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

  it('GET /health', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('registers, logs in, fetches me, and rejects bad login', async () => {
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

    const registerBody = registerRes.body as {
      data?: {
        register: {
          accessToken: string;
          refreshToken: string | null;
          user: { email: string };
        };
      };
      errors?: unknown[];
    };

    expect(registerBody.errors).toBeUndefined();
    expect(registerBody.data?.register.user.email).toBe('mvp@lumora.test');
    expect(registerBody.data?.register.refreshToken).toBeNull();

    const loginRes = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation Login($input: LoginInput!) {
            login(input: $input) {
              accessToken
              refreshToken
              user { email }
            }
          }
        `,
        variables: {
          input: { email: 'mvp@lumora.test', password: 'password1' },
        },
      })
      .expect(200);

    const loginBody = loginRes.body as {
      data?: {
        login: {
          accessToken: string;
          refreshToken: string | null;
          user: { email: string };
        };
      };
      errors?: unknown[];
    };

    expect(loginBody.errors).toBeUndefined();
    expect(loginBody.data?.login.user.email).toBe('mvp@lumora.test');
    expect(loginBody.data?.login.refreshToken).toBeNull();

    const token = loginBody.data!.login.accessToken;

    const meRes = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: `
          query Me {
            me { id email displayName }
          }
        `,
      })
      .expect(200);

    expect(meRes.body.data.me.email).toBe('mvp@lumora.test');

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
