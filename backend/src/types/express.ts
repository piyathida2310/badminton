import { Request } from 'express';
import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  sub: string;
  username?: string;
  role: Role;
  email: string;
}

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
