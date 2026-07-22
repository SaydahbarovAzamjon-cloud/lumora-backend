import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<
    Pick<
      UsersService,
      | 'findByEmail'
      | 'findByEmailWithPassword'
      | 'createEmailUser'
      | 'findById'
      | 'upsertGoogleUser'
    >
  >;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;
  let verifyIdToken: jest.Mock;

  const baseUser = {
    id: 'user-1',
    email: 'alex@example.com',
    displayName: 'Alex',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    passwordHash: '',
  };

  beforeEach(async () => {
    verifyIdToken = jest.fn();
    (OAuth2Client as unknown as jest.Mock).mockImplementation(() => ({
      verifyIdToken,
    }));

    usersService = {
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      createEmailUser: jest.fn(),
      findById: jest.fn(),
      upsertGoogleUser: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('signed-jwt'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'GOOGLE_CLIENT_ID') return 'google-client';
              return undefined;
            },
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('registers a new email user and returns an access token', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    usersService.createEmailUser.mockResolvedValue(baseUser as never);

    const result = await service.register({
      email: 'Alex@Example.com',
      password: 'password1',
      displayName: 'Alex',
    });

    expect(usersService.createEmailUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'alex@example.com',
        displayName: 'Alex',
      }),
    );
    expect(result.accessToken).toBe('signed-jwt');
    expect(result.refreshToken).toBeNull();
    expect(result.user.id).toBe('user-1');
  });

  it('rejects duplicate email registration', async () => {
    usersService.findByEmail.mockResolvedValue(baseUser as never);

    await expect(
      service.register({
        email: 'alex@example.com',
        password: 'password1',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in with a valid password', async () => {
    const passwordHash = await bcrypt.hash('password1', 4);
    usersService.findByEmailWithPassword.mockResolvedValue({
      ...baseUser,
      passwordHash,
    } as never);

    const result = await service.login({
      email: 'alex@example.com',
      password: 'password1',
    });

    expect(result.accessToken).toBe('signed-jwt');
  });

  it('rejects invalid login credentials', async () => {
    usersService.findByEmailWithPassword.mockResolvedValue(null);

    await expect(
      service.login({ email: 'alex@example.com', password: 'nope' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns the current user for me()', async () => {
    usersService.findById.mockResolvedValue(baseUser as never);

    const me = await service.me('user-1');
    expect(me.email).toBe('alex@example.com');
  });

  it('logs in with a valid Google ID token', async () => {
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'google-sub-1',
        email: 'Alex@Example.com',
        email_verified: true,
        name: 'Alex G',
      }),
    });
    usersService.upsertGoogleUser.mockResolvedValue({
      ...baseUser,
      displayName: 'Alex G',
    } as never);

    const result = await service.loginWithGoogle({ idToken: 'good-token' });

    expect(verifyIdToken).toHaveBeenCalledWith({
      idToken: 'good-token',
      audience: 'google-client',
    });
    expect(usersService.upsertGoogleUser).toHaveBeenCalledWith({
      email: 'alex@example.com',
      googleSubject: 'google-sub-1',
      displayName: 'Alex G',
    });
    expect(result.accessToken).toBe('signed-jwt');
    expect(result.refreshToken).toBeNull();
  });

  it('rejects invalid Google ID tokens', async () => {
    verifyIdToken.mockRejectedValue(new Error('bad token'));

    await expect(
      service.loginWithGoogle({ idToken: 'bad-token' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects Google accounts without a verified email', async () => {
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'google-sub-1',
        email: 'alex@example.com',
        email_verified: false,
      }),
    });

    await expect(
      service.loginWithGoogle({ idToken: 'unverified' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
