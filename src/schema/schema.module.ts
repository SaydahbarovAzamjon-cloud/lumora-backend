import { Module } from '@nestjs/common';
import { SchemaFoundationMutationsResolver } from './schema-foundation.mutations.resolver';
import { SchemaFoundationResolver } from './schema-foundation.resolver';

/**
 * Registers GraphQL object/input types via resolvers so the schema is emitted.
 * Domain services/guards are added in later Phase 1 tasks.
 */
@Module({
  providers: [SchemaFoundationResolver, SchemaFoundationMutationsResolver],
})
export class SchemaModule {}
