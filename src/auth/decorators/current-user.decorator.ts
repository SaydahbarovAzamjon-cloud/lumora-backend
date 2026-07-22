import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserModel } from '../models/user.model';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserModel => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext<{ req: { user: UserModel } }>().req.user;
  },
);
