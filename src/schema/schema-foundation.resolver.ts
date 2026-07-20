import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { RecommendationConnectionType } from './types/recommendation-connection.type';
import { RecommendationType } from './types/recommendation.type';
import { UserType } from './types/user.type';

/**
 * Schema-foundation resolver.
 * Registers MVP Query fields so NestJS can emit the GraphQL schema.
 * Business logic lands in later auth/analysis/history tasks (T-101+).
 */
@Resolver()
export class SchemaFoundationResolver {
  @Query(() => String, {
    name: '_schemaHealth',
    description:
      'Temporary health field confirming GraphQL schema bootstrap. Remove once domain resolvers are live.',
  })
  schemaHealth(): string {
    return 'ok';
  }

  /**
   * Declared for schema emission only — not implemented yet (requires auth).
   */
  @Query(() => UserType, {
    name: 'me',
    description: 'Current authenticated user. Implementation: T-101.',
  })
  me(): never {
    throw new Error('Not implemented: me (requires auth module T-101)');
  }

  @Query(() => RecommendationConnectionType, {
    name: 'recommendationHistory',
    description:
      'Paginated recommendation history for the current user. Implementation: T-106.',
  })
  recommendationHistory(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 })
    limit?: number,
    @Args('cursor', { type: () => String, nullable: true }) cursor?: string,
  ): never {
    void limit;
    void cursor;
    throw new Error('Not implemented: recommendationHistory (requires T-106)');
  }

  @Query(() => RecommendationType, {
    name: 'recommendation',
    nullable: true,
    description:
      'Single recommendation owned by the current user. Implementation: T-106.',
  })
  recommendation(@Args('id', { type: () => String }) id: string): never {
    void id;
    throw new Error('Not implemented: recommendation (requires T-106)');
  }
}
