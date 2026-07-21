import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticatedUser } from './auth.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext<{ req: { user?: AuthenticatedUser } }>().req
      .user;
    if (!user?.userId) {
      throw new UnauthorizedException('Authentication required');
    }
    return user;
  },
);
