import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface User {
  sub: string;
  email: string;
}

interface AuthenticatedRequest extends Request {
  user: User;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return req.user;
  },
);
