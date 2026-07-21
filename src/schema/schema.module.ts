import { Module } from '@nestjs/common';
import { SchemaFoundationResolver } from './schema-foundation.resolver';

@Module({
  providers: [SchemaFoundationResolver],
})
export class SchemaModule {}
