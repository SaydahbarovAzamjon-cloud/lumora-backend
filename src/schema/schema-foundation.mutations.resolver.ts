import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AnalyzeFaceInput } from './inputs/analyze-face.input';
import {
  GoogleAuthInput,
  LoginInput,
  RegisterInput,
} from './inputs/auth.input';
import { AuthPayloadType } from './types/auth-payload.type';
import { FaceAnalysisResultType } from './types/face-analysis-result.type';

/**
 * Declares MVP Mutation fields for schema emission.
 * Implementations arrive with T-101 (auth) and T-105 (analyzeFace).
 */
@Resolver()
export class SchemaFoundationMutationsResolver {
  @Mutation(() => AuthPayloadType, {
    description: 'Register with email/password. Implementation: T-101.',
  })
  register(@Args('input') input: RegisterInput): never {
    void input;
    throw new Error('Not implemented: register (requires T-101)');
  }

  @Mutation(() => AuthPayloadType, {
    description: 'Login with email/password. Implementation: T-101.',
  })
  login(@Args('input') input: LoginInput): never {
    void input;
    throw new Error('Not implemented: login (requires T-101)');
  }

  @Mutation(() => AuthPayloadType, {
    description: 'Login or link via Google OAuth. Implementation: T-101.',
  })
  loginWithGoogle(@Args('input') input: GoogleAuthInput): never {
    void input;
    throw new Error('Not implemented: loginWithGoogle (requires T-101)');
  }

  @Mutation(() => Boolean, {
    description:
      'Logout / invalidate session if refresh strategy exists. Implementation: T-101 / OPEN-014.',
  })
  logout(): never {
    throw new Error('Not implemented: logout (requires T-101)');
  }

  @Mutation(() => FaceAnalysisResultType, {
    description:
      'Submit landmarks, orchestrate AI, persist history. Implementation: T-105.',
  })
  analyzeFace(@Args('input') input: AnalyzeFaceInput): never {
    void input;
    throw new Error('Not implemented: analyzeFace (requires T-105)');
  }
}
